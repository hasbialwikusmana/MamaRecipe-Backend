const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

// BUATKAN DENGAN ORM SEQUELIZE

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "DESC";

    const result = await models.like.findAndCountAll({
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
    const result = await models.like.findByPk(id);
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

    const data = req.body;
    data.id = uuidv4();
    data.user_id = user_id;
    data.recipe_id = req.params.recipe_id;

    const result = await models.like.create(data);

    const response = {
      id: result.id,
      user_id: result.user_id,
      recipe_id: result.recipe_id,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    commonHelpers.response(res, response, 201);
  } catch (error) {
    next(error);
  }
};

const deleteLiked = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await models.like.destroy({ where: { id } });
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to delete like");
    }
    commonHelpers.response(res, null, 200, "Like deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getLikedById,
  createLiked,
  deleteLiked,
};
