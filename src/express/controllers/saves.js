const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

const saveSchema = Joi.object({
  recipe_id: Joi.string().uuid().required(),
});

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "DESC";
    const userId = req.payload.id;

    const result = await models.save.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: models.recipe,
          attributes: ["title", "image"],
        },
      ],
      order: [[sortBy, order]],
      limit: limit,
      offset: offset,
    });

    const totalPage = Math.ceil(result.count / limit);
    const pagination = {
      page,
      totalPage,
      limit,
      totalData: result.count,
    };

    commonHelpers.response(res, result.rows, 200, null, pagination);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const getSavedById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await models.save.findByPk(id);
    if (!result) {
      commonHelpers.response(res, null, 404, "Save not found");
    }
    commonHelpers.response(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const saveRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await models.recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    await recipe.update({ isSaved: !recipe.isSaved });

    return res.status(200).json({ message: `Recipe ${recipe.isSaved ? "saved" : "unsaved"} successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getSavedById,
  saveRecipe,
};
