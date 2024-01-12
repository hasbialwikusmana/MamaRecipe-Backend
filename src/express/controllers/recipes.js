const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const cloudinary = require("../middlewares/cloudinary");
const errorServer = new createError.InternalServerError();

// BUATKAN DENGAN ORM SEQUELIZE

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "DESC";

    const result = await models.recipe.findAndCountAll({
      where: {
        [models.Sequelize.Op.or]: [models.Sequelize.literal(`LOWER("title") LIKE LOWER('%${search}%')`)],
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

const getRecipeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await models.recipe.findByPk(id);
    if (!result) {
      commonHelpers.response(res, null, 404, "Recipe not found");
    }
    commonHelpers.response(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const user_id = req.payload.id;
    const data = req.body;

    data.id = uuidv4();
    data.user_id = user_id;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      data.image = upload.secure_url;
    } else {
      return commonHelpers.response(res, null, 400, "Image is required");
    }

    const result = await models.recipe.create(data);

    const response = {
      id: result.id,
      user_id: result.user_id,
      title: result.title,
      ingredients: result.ingredients,
      image: result.image,
      video: result.video,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
    commonHelpers.response(res, response, 200, null);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user_id = req.payload.id;
    const newData = req.body;

    const oldDataResult = await models.recipe.findByPk(id);
    if (!oldDataResult) {
      return commonHelpers.response(res, null, 404, "Recipe not found");
    }

    const oldData = oldDataResult.dataValues;

    const data = { ...oldData, ...newData };
    data.id = id;
    data.user_id = user_id;

    if (req.file) {
      // Handle Cloudinary image deletion only if it exists
      if (oldData.image) {
        const public_id = oldData.image.split("/").pop().split(".").shift();
        await cloudinary.uploader.destroy(public_id);
      }

      // Upload new image to Cloudinary
      const upload = await cloudinary.uploader.upload(req.file.path);
      data.image = upload.secure_url;
      data.video = upload.url;
    }

    // Perform the update with the new data
    const result = await models.recipe.update(data, { where: { id: id } });
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to update recipe");
    }

    // Prepare the response object
    const response = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      ingredients: data.ingredients,
      image: data.image,
      video: data.video,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    commonHelpers.response(res, response, 200, null);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const id = req.params.id;

    const oldResult = await models.recipe.findByPk(id);
    if (!oldResult) {
      return commonHelpers.response(res, null, 404, "Recipe not found");
    }

    // Handle Cloudinary image deletion only if it exists
    if (oldResult.image) {
      const public_id = oldResult.image.split("/").pop().split(".").shift();
      await cloudinary.uploader.destroy(public_id);
    }

    const result = await models.recipe.destroy({ where: { id: id } });
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to delete recipe");
    }

    commonHelpers.response(res, null, 200, "Recipe deleted successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  getAll,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};