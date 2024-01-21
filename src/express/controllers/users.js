const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const authHelpers = require("../helpers/auth");
const commonHelpers = require("../helpers/common");
const models = require("../databases/models");
const createError = require("http-errors");
const cloudinary = require("../middlewares/cloudinary");
const errorServer = new createError.InternalServerError();

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "DESC";

    const result = await models.user.findAndCountAll({
      where: {
        [models.Sequelize.Op.or]: [models.Sequelize.literal(`LOWER("name") LIKE LOWER('%${search}%')`)],
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

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await models.user.findByPk(id, { attributes: { exclude: ["password"] } });

    if (!result) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const register = async (req, res, next) => {
  try {
    const checkEmail = await models.user.findOne({ where: { email: req.body.email } });
    if (checkEmail) {
      return commonHelpers.response(res, null, 400, "Email already exists");
    }

    const schema = Joi.object({
      name: Joi.string().empty("").required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .custom((value, helpers) => {
          if (!value.includes("@gmail.com")) {
            return helpers.message("Invalid email domain. Only gmail.com is allowed.");
          }
          return value;
        })
        .empty("")
        .required(),
      phone: Joi.string().empty("").required(),
      password: Joi.string().min(8).empty("").required(),
      confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Confirm password must match password",
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const userId = uuidv4();

    req.body.password = hashPassword;
    req.body.id = userId;

    const result = await models.user.create(req.body);

    const data = {
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    commonHelpers.response(res, data, 200, null);
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().empty("").required(),
      password: Joi.string().min(8).empty("").required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    }

    const users = await models.user.findOne({ where: { email: req.body.email } });

    if (!users) {
      return commonHelpers.response(res, null, 400, "Email not found");
    }

    const checkPassword = await bcrypt.compare(req.body.password, users.password);

    if (!checkPassword) {
      return commonHelpers.response(res, null, 400, "Password is wrong");
    }

    delete users.dataValues.password;
    const payload = {
      id: users.id,
      email: users.email,
    };

    users.dataValues.token = authHelpers.generateToken(payload);
    users.dataValues.refreshToken = authHelpers.generateRefreshToken(payload);

    commonHelpers.response(res, users, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_JWT);
  let payload = {
    email: decoded.email,
    id: decoded.id,
  };
  const result = {
    token: authHelpers.generateToken(payload),
    refreshToken: authHelpers.generateRefreshToken(payload),
  };
  commonHelpers.response(res, result, 200);
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.payload.id;
    const result = await models.user.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!result) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const id = req.params.id;
    const schema = Joi.object({
      name: Joi.string().empty("").required(),
      phone: Joi.string().empty("").required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    }

    const result = await models.user.update(req.body, { where: { id: id } });

    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to update user");
    }

    const data = await models.user.findByPk(id, { attributes: { exclude: ["password"] } });

    commonHelpers.response(res, data, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const updateImage = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!req.file) {
      return commonHelpers.response(res, null, 400, "Image is required");
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    const image = result.secure_url;

    const users = await models.user.findOne({ where: { id: id } });
    if (!users) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    const data = {
      id: id,
      image: image,
      updatedAt: users.updatedAt,
    };

    if (users.image !== null) {
      const public_id = users.image.split("/").pop().split(".").shift();
      await cloudinary.uploader.destroy(public_id);
    }

    const update = await models.user.update(data, { where: { id: id } });
    if (!update) {
      return commonHelpers.response(res, null, 400, "Failed to update user");
    }

    commonHelpers.response(res, data, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const id = req.params.id;
    const schema = Joi.object({
      oldPassword: Joi.string().min(8).empty("").required(),
      newPassword: Joi.string().min(8).empty("").required(),
      confirmNewPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
        "any.only": "Confirm password must match password",
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    }

    const users = await models.user.findOne({ where: { id: id } });
    if (!users) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    const checkPassword = await bcrypt.compare(req.body.oldPassword, users.password);
    if (!checkPassword) {
      return commonHelpers.response(res, null, 400, "Password is wrong");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.newPassword, salt);

    const data = {
      id: id,
      password: hashPassword,
      updatedAt: users.updatedAt,
    };

    const update = await models.user.update(data, { where: { id: id } });
    if (!update) {
      return commonHelpers.response(res, null, 400, "Failed to update user");
    }

    commonHelpers.response(res, data, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const id = req.params.id;

    const users = await models.user.findOne({ where: { id: id } });
    if (!users) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    if (users.image !== null) {
      const public_id = users.image.split("/").pop().split(".").shift();
      await cloudinary.uploader.destroy(public_id);
    }

    const result = await models.user.destroy({ where: { id: id } });

    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to delete user");
    }

    commonHelpers.response(res, null, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

module.exports = { register, login, refreshToken, getProfile, getAll, getUserById, updateProfile, updateImage, updatePassword, deleteProfile };
