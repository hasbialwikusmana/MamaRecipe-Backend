"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("likes", [
      {
        id: uuidv4(), // Generate UUID automatically
        user_id: uuidv4(), // Generate UUID automatically
        recipe_id: uuidv4(), // Generate UUID automatically
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("likes", null, {});
  },
};
