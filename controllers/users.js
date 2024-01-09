const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const authHelpers = require("../helpers/auth");
const commonHelpers = require("../helpers/common");
const models = require("../models");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

// BUATKAN DENGAN ORM SEQUELIZE
const getAll = async (req, res, next) => {
  try {
    const result = await models.user.findAll();
    commonHelpers.response(res, result, 200, "success get all users");
  } catch (error) {
    console.log(error);
  }
};
const register = async (req, res, next) => {
  try {
    // register sequelize cli
    const schema = Joi.object({
      name: Joi.string().empty("").required(),
      email: Joi.string().email().empty("").required(),
      phone: Joi.string().empty("").required(),
      password: Joi.string().min(8).empty("").required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    } else {
      const checkEmail = await models.user.findOne({ where: { email: req.body.email } });
      if (checkEmail) {
        return commonHelpers.response(res, null, 400, "Email already exists");
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const userId = uuidv4();

    req.body.password = hashPassword;
    req.body.id = userId;

    const result = await models.user.create(req.body);

    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return next(errorServer);
    }

    const checkEmail = await Users.findOne({ where: { email: email } });
    if (!checkEmail) {
      return next(errorServer);
    }

    const checkPassword = await bcrypt.compare(password, checkEmail.dataValues.password);
    if (!checkPassword) {
      return next(errorServer);
    }

    const payload = {
      id: checkEmail.dataValues.id,
      email: checkEmail.dataValues.email,
      phone: checkEmail.dataValues.phone,
    };

    const token = authHelpers.generateToken(payload);
    const refreshToken = authHelpers.generateRefreshToken(payload);

    const result = {
      token: token,
      refreshToken: refreshToken,
    };

    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    return next(errorServer);
  }
};

const profile = async (req, res, next) => {
  // payload dari token

  try {
    const payload = req.payload;

    const result = await Users.findOne({
      where: { id: payload.id },
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });

    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    return next(errorServer);
  }
};

module.exports = { register, login, profile, getAll };
