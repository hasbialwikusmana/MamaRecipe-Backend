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
    const user_id = req.payload.id;
    const recipe_id = req.params.recipe_id;

    // Check if the user has already saved the recipe
    const existingSave = await models.save.findOne({
      where: { user_id, recipe_id },
    });

    if (existingSave) {
      await models.save.create({ where: { user_id, recipe_id } });
      return commonHelpers.response(res, null, 200, "Recipe unsave successfully");
    }

    const data = { id: uuidv4(), user_id, recipe_id };

    const result = await models.save.create(data);

    const response = {
      id: result.id,
      user_id: result.user_id,
      recipe_id: result.recipe_id,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    commonHelpers.response(res, response, 201, "Recipe saved successfully");
  } catch (error) {
    next(error);
  }
};

const unsaveRecipe = async (req, res, next) => {
  try {
    const user_id = req.payload.id;
    const recipe_id = req.params.recipe_id;

    // Check if the user has saved the recipe
    const existingSave = await models.save.findOne({
      where: { user_id, recipe_id },
    });

    if (!existingSave) {
      await models.save.destroy({ where: { user_id, recipe_id } });
      return commonHelpers.response(res, null, 400, "Recipe not saved");
    }

    await models.save.destroy({ where: { user_id, recipe_id } });

    commonHelpers.response(res, null, 200, "Recipe unsaved successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getSavedById,
  saveRecipe,
  unsaveRecipe,
};
