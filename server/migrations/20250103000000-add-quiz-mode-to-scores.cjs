"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("score", "quiz_mode", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "daily",
      validate: {
        isIn: [["daily", "blitz"]],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("score", "quiz_mode");
  },
};
