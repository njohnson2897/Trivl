"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE score DROP CONSTRAINT IF EXISTS "score_quiz_mode_check";
    `);

    // Add the new constraint with 'category' included
    await queryInterface.sequelize.query(`
      ALTER TABLE score ADD CONSTRAINT "score_quiz_mode_check" 
      CHECK (quiz_mode IN ('daily', 'blitz', 'category'));
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the new constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE score DROP CONSTRAINT IF EXISTS "score_quiz_mode_check";
    `);

    // Restore the original constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE score ADD CONSTRAINT "score_quiz_mode_check" 
      CHECK (quiz_mode IN ('daily', 'blitz'));
    `);
  },
};
