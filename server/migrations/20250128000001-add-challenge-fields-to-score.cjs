"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("score", "challenge_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "challenge",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("score", "opponent_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("score", "opponent_username", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("score", "won_challenge", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("score", "won_challenge");
    await queryInterface.removeColumn("score", "opponent_username");
    await queryInterface.removeColumn("score", "opponent_id");
    await queryInterface.removeColumn("score", "challenge_id");
  },
};
