"use strict";
const { v4 } = require("uuid");
const bycrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bycrypt.genSalt(10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: v4(),
          username: "Admin",
          email: "admin@gmail.com",
          password: bycrypt.hashSync("admin123", salt),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
