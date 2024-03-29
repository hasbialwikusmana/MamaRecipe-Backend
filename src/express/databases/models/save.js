"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class save extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      save.belongsTo(models.recipe, {
        foreignKey: "recipe_id",
        onDelete: "CASCADE",
      });
      save.belongsTo(models.user, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
    }
  }
  save.init(
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
      recipe_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "save",
    }
  );
  return save;
};
