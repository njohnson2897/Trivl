"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("challenge", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      challenger_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      challenged_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      questions: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "in_progress", "completed"),
        defaultValue: "pending",
      },
      challenger_score: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      challenged_score: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      challenger_time_taken: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      challenged_time_taken: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      winner_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      completed_at: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("challenge");
  },
};
