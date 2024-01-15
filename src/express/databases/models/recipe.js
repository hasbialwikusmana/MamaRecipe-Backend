"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      recipe.hasMany(models.like, {
        foreignKey: "recipe_id",
        as: "likes",
        onDelete: "CASCADE",
      });

      recipe.hasMany(models.save, {
        foreignKey: "recipe_id",
        as: "saves",
        onDelete: "CASCADE",
      });
    }
  }
  recipe.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ingredients: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      video: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      saveCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "recipe",
    }
  );
  return recipe;
};
