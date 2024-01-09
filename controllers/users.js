const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const authHelpers = require("../helpers/auth");
const commonHelpers = require("../helpers/common");
const userModel = require("../models/users");
const createError = require("http-errors");
const errorServer = new createError.InternalServerError();

// BUATKAN DENGAN ORM SEQUELIZE

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Pengecekan email
    const existingUser = await userModel.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Membuat hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      name: name,
      email: email,
      phone: phone,
      password: hashedPassword,
    };

    const user = await userModel.create(newUser);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
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

    const checkEmail = await userModel.findOne({ where: { email: email } });
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

    const result = await userModel.findOne({
      where: { id: payload.id },
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });

    commonHelpers.response(res, result, 200, null);
  } catch (error) {
    return next(errorServer);
  }
};

module.exports = { register, login, profile };
