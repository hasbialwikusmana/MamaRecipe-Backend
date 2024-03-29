"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.recipe, {
        foreignKey: "user_id",
        as: "recipes",
        onDelete: "CASCADE",
      });
      user.hasMany(models.like, {
        foreignKey: "user_id",
        as: "likes",
        onDelete: "CASCADE",
      });
      user.hasMany(models.save, {
        foreignKey: "user_id",
        as: "saves",
        onDelete: "CASCADE",
      });
      user.hasMany(models.comment, {
        foreignKey: "user_id",
        as: "comments",
        onDelete: "CASCADE",
      });
    }
  }
  user.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};
