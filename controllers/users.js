const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const authHelpers = require("../helpers/auth");
const commonHelpers = require("../helpers/common");
const models = require("../models");
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

    const result = await models.user.findAndCountAll({
      where: {
        name: { [models.Sequelize.Op.like]: `%${search}%` },
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
  }
};
const register = async (req, res, next) => {
  try {
    // register sequelize cli
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
      id: users.dataValues.id,
      email: users.dataValues.email,
    };

    users.dataValues.token = authHelpers.generateToken(payload);
    users.dataValues.refreshToken = authHelpers.generateRefreshToken(payload);

    commonHelpers.response(res, users, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const profile = async (req, res, next) => {
  // payload dari token

  try {
    const id = req.payload.id;
    const result = await models.user.findOne({ where: { id: id } });
    if (!result) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    delete result.dataValues.password;
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

    // cek id params jika tidak ada maka error not found
    const users = await models.user.findByPk(id);
    if (!users) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    // update data req.body
    const result = await models.user.update(req.body, { where: { id: id } });

    // cek jika result tidak ada maka error
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to update user");
    }

    // ambil data user yang sudah diupdate
    const data = {
      id: id,
      name: users.name,
      phone: users.phone,
      updatedAt: users.updatedAt,
    };

    commonHelpers.response(res, data, 200, null);
  } catch (error) {
    console.log(error);
    next(errorServer);
  }
};

const updateImage = async (req, res, next) => {
  try {
    const id = req.params.id;
    // const schema = Joi.object({
    //   image: Joi.string().empty("").required(),
    // });

    // const { error } = schema.validate(req.body);

    // if (error) {
    //   return commonHelpers.response(res, null, 400, error.details[0].message.replace(/\"/g, ""));
    // }

    // Cek ID params, jika tidak ada maka respons dengan "User not found"
    const user = await models.user.findByPk(id);
    if (!user) {
      return commonHelpers.response(res, null, 400, "User not found");
    }

    // Upload gambar ke Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.body.image);

    // Update data user dari null gambar ke Cloudinary

    const result = await models.user.update({ image: cloudinaryResponse.secure_url }, { where: { id: id } });

    // Cek jika update gagal, respons dengan "Failed to update user"
    if (!result) {
      return commonHelpers.response(res, null, 400, "Failed to update user");
    }

    // Ambil data user yang sudah diupdate
    const data = {
      id: id,
      image: cloudinaryResponse.secure_url,
      updatedAt: result[1][0].updatedAt, // Mengambil tanggal dan waktu terakhir diupdate
    };

    commonHelpers.response(res, data, 200, null);
  } catch (error) {
    console.error(error);
    next(errorServer);
  }
};

module.exports = { register, login, profile, getAll, updateProfile, updateImage };
