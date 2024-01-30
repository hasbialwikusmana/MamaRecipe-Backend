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

const createLiked = async (req, res, next) => {
  try {
    const user_id = req.payload.id;
    const recipe_id = req.params.recipe_id;

    // Check if the user has already liked the recipe
    const existingLike = await models.like.findOne({
      where: { user_id, recipe_id },
    });

    if (existingLike) {
      await models.like.destroy({ where: { user_id, recipe_id } });
      return commonHelpers.response(res, null, 200, "Recipe unliked successfully");
    } else {
      const data = { id: uuidv4(), user_id, recipe_id };

      const result = await models.like.create(data);

      const response = {
        id: result.id,
        user_id: result.user_id,
        recipe_id: result.recipe_id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      commonHelpers.response(res, response, 201, "Recipe liked successfully");
    }
  } catch (error) {
    next(error);
  }
};

const unlikeRecipe = async (req, res, next) => {
  try {
    const user_id = req.payload.id;
    const recipe_id = req.params.recipe_id;

    // Check if the user has liked the recipe
    const existingLike = await models.like.findOne({
      where: { user_id, recipe_id },
    });

    if (!existingLike) {
      await models.like.destroy({ where: { user_id, recipe_id } });
      return commonHelpers.response(res, null, 400, "Recipe not liked");
    } else {
      await models.like.destroy({ where: { user_id, recipe_id } });
      return commonHelpers.response(res, null, 200, "Recipe unliked successfully");
    }
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
