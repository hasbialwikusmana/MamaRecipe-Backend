const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "DESC";

    const result = await models.comment.findAndCountAll({
      where: {
        [models.Sequelize.Op.or]: [models.Sequelize.literal(`LOWER("comment") LIKE LOWER('%${search}%')`)],
      },

      attributes: { exclude: ["password"] },
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

const getAllComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await models.comment.findAndCountAll({
      where: {
        recipe_id: req.params.recipeId,
      },
      include: [
        {
          model: models.user,
          as: "user",
          attributes: ["id", "name", "image"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit: limit,
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

const getCommentById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id;
    const result = await models.comment.findByPk(id);

    if (!result) {
      return commonHelpers.response(res, null, 404, "Comment not found");
    }

    if (result.user_id !== userId) {
      return commonHelpers.response(res, null, 403, "Forbidden - You do not have permission to access this comment");
    }

    commonHelpers.response(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const recipeId = req.params.recipeId;
    const userId = req.payload.id;

    const newComment = {
      comment,
      recipe_id: recipeId,
      user_id: userId,
    };

    const createdComment = await models.comment.create(newComment, {
      include: [
        {
          model: models.user,
          as: "user",
          attributes: ["id", "name", "image"],
        },
      ],
    });

    commonHelpers.response(res, createdComment, 201, "Comment created successfully");
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.payload.id;
    const { comment } = req.body;

    const existingComment = await models.comment.findOne({
      where: {
        id: commentId,
        user_id: userId,
      },
    });

    if (!existingComment) {
      return commonHelpers.response(res, null, 404, "Comment not found or you don't have permission");
    }

    const updatedComment = await existingComment.update({ comment });

    commonHelpers.response(res, updatedComment, 200, "Comment updated successfully");
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};
const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.payload.id;

    const existingComment = await models.comment.findOne({
      where: {
        id: commentId,
        user_id: userId,
      },
    });

    if (!existingComment) {
      return commonHelpers.response(res, null, 404, "Comment not found or you don't have permission");
    }

    await existingComment.destroy();

    commonHelpers.response(res, null, 200, "Comment deleted successfully");
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

module.exports = {
  getAll,
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
