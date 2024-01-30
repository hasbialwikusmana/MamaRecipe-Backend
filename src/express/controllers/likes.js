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

const likeRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await models.recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    await recipe.update({ isLiked: !recipe.isLiked });

    return res.status(200).json({ message: `Recipe ${recipe.isLiked ? "liked" : "unliked"} successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getLikedById,
  likeRecipe,
};
