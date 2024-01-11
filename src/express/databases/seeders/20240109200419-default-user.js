"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("users", [
      {
        id: uuidv4(), // Generate UUID automatically
        name: "John Doe",
        email: "example@gmail.com",
        phone: "08123456789",
        password: "12345678",
        image: "https://i.ibb.co/3YtYDvK/1.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
