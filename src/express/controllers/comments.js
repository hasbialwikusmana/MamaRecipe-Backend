const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

const commentSchema = Joi.object({
  comment: Joi.string().required(),
});

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
    const { recipeId } = req.params;

    // Ambil semua komentar terkait dengan suatu resep
    const comments = await models.comment.findAll({
      where: {
        recipe_id: recipeId,
      },
      include: {
        model: models.user,
        attributes: ["id", "name", "image"],
      },
    });

    // Kirim respons dengan data komentar dan data user terkait
    res.status(200).json({
      data: comments.map((comment) => ({
        id: comment.id,
        comment: comment.comment,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          image: comment.user.image,
        },
      })),
    });
  } catch (error) {
    console.error(error);
    next(error);
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
    const { recipeId } = req.params;
    const { comment } = req.body;
    const userId = req.payload.id;

    // Buat komentar baru di basis data
    const newComment = await models.comment.create({
      comment,
      user_id: userId,
      recipe_id: recipeId,
    });

    // Ambil data user terkait dengan komentar
    const user = await models.user.findByPk(userId);

    // Kirim respons dengan data komentar dan data user terkait
    res.status(201).json({
      data: {
        id: newComment.id,
        comment: newComment.comment,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user_id = req.payload.id;
    const data = req.body;
    const checkComment = await models.comment.findByPk(id);
    if (!checkComment) {
      return commonHelpers.response(res, null, 404, "Comment not found");
    }

    const { error } = commentSchema.validate(data);
    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    }

    const result = await models.comment.update(data, { where: { id } });
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to update comment");
    }

    const response = {
      id: id,
      user_id: user_id,
      recipe_id: checkComment.recipe_id,
      comment: data.comment,
      createdAt: checkComment.createdAt,
      updatedAt: checkComment.updatedAt,
    };
    commonHelpers.response(res, response, 200, null);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user_id = req.payload.id;
    const checkComment = await models.comment.findByPk(id);
    if (!checkComment) {
      return commonHelpers.response(res, null, 404, "Comment not found");
    }
    if (checkComment.user_id !== user_id) {
      return commonHelpers.response(res, null, 403, "Forbidden");
    }
    const result = await models.comment.destroy({ where: { id } });
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to delete comment");
    }
    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    next(error);
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
