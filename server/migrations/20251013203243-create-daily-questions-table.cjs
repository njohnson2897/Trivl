"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daily_questions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: Sequelize.DATEONLY, // Stores just the date (YYYY-MM-DD)
        allowNull: false,
        unique: true,
      },
      questions: {
        type: Sequelize.JSON, // Array of 10 question objects
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add index on date for faster lookups
    await queryInterface.addIndex("daily_questions", ["date"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("daily_questions");
  },
};
