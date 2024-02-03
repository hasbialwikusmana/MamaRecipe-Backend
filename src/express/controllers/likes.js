const { v4: uuidv4 } = require("uuid");
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

    const result = await models.like.findAndCountAll({
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

const getLikedById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await models.like.findByPk(id, {
      include: [
        {
          model: models.recipe,
          attributes: ["title", "image"],
        },
      ],
    });
    if (!result) {
      commonHelpers.response(res, null, 404, "Like not found");
    }
    commonHelpers.response(res, result, 200);
  } catch (error) {
    next(error);
  }
};

// CREATE LIKE RECIPE BY USER ID AND RECIPE ID (POST) /likes

const createLiked = async (req, res, next) => {
  try {
    const userId = req.payload.id;
    const recipeId = req.body.recipe_id;
    const like = await models.like.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });
    if (like) {
      return commonHelpers.response(res, null, 400, "You already liked this recipe");
    }
    const newLike = await models.like.create({
      id: uuidv4(),
      user_id: userId,
      recipe_id: recipeId,
    });
    commonHelpers.response(res, newLike, 201);
  } catch (error) {
    next(error);
  }
};

// UNLIKE RECIPE BY USER ID AND RECIPE ID (DELETE) /likes/:id

const unlikeRecipe = async (req, res, next) => {
  try {
    const userId = req.payload.id;
    const recipeId = req.params.recipe_id;
    const like = await models.like.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });
    if (!like) {
      return commonHelpers.response(res, null, 400, "You haven't liked this recipe");
    }
    await like.destroy();
    commonHelpers.response(res, null, 200, "Recipe unliked successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getLikedById,
  createLiked,
  unlikeRecipe,
};
