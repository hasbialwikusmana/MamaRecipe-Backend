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
    const { recipe_id } = req.params;

    const comments = await models.comment.findAll({
      where: {
        recipe_id: recipe_id,
      },
      include: {
        model: models.user,
        attributes: ["id", "name", "image"],
      },
    });

    res.status(200).json({
      data: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
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
    const user_id = req.payload.id;

    const data = req.body;
    const { error } = commentSchema.validate(data);
    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    }
    data.id = uuidv4();
    data.user_id = user_id;
    data.recipe_id = req.params.recipe_id;

    const result = await models.comment.create(data);
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to create comment");
    }

    const response = {
      id: result.id,
      user_id: result.user_id,
      recipe_id: result.recipe_id,
      comment: result.comment,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    commonHelpers.response(res, response, 201, null);
  } catch (error) {
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
