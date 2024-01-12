"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("recipes", [
      {
        id: uuidv4(), // Generate UUID automatically
        user_id: uuidv4(), // Generate UUID automatically
        title: "John Doe",
        ingredients: "test",
        image: "https://i.ibb.co/3YtYDvK/1.jpg",
        video: "https://www.youtube.com/watch?v=5qap5aO4i9A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("recipes", null, {});
  },
};
