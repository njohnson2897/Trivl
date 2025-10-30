"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("challenge", "challenger_answers", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn("challenge", "challenged_answers", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("challenge", "challenger_answers");
    await queryInterface.removeColumn("challenge", "challenged_answers");
  },
};


