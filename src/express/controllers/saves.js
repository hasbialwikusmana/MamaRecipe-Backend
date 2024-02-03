const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

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

// CREATE SAVE RECIPE BY USER ID AND RECIPE ID (POST) /saves

const saveRecipe = async (req, res, next) => {
  try {
    const userId = req.payload.id;
    const { recipe_id } = await saveSchema.validateAsync(req.body);
    const recipe = await models.recipe.findByPk(id);
    if (!recipe) {
      commonHelpers.response(res, null, 404, "Recipe not found");
    }
    const save = await models.save.findOne({
      where: { user_id: userId, recipe_id },
    });
    if (save) {
      commonHelpers.response(res, null, 400, "Recipe already saved");
    }
    const result = await models.save.create({
      id: uuidv4(),
      user_id: userId,
      recipe_id,
    });
    commonHelpers.response(res, result, 201);
  } catch (error) {
    next(error);
  }
};

// DELETE SAVE RECIPE BY USER ID AND RECIPE ID (DELETE) /saves/:id

const unsaveRecipe = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id;
    const save = await models.save.findOne({
      where: { user_id: userId, id },
    });
    if (!save) {
      commonHelpers.response(res, null, 404, "Save not found");
    }
    await save.destroy();
    commonHelpers.response(res, save, 200);
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
