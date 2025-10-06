'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop the existing quiz_mode constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE score DROP CONSTRAINT IF EXISTS "score_quiz_mode_check";
    `);

    // Add the new constraint with 'survival' included
    await queryInterface.sequelize.query(`
      ALTER TABLE score ADD CONSTRAINT "score_quiz_mode_check" 
      CHECK (quiz_mode IN ('daily', 'blitz', 'category', 'survival'));
    `);

    // Drop the existing quiz_score constraint (which has max: 10)
    await queryInterface.sequelize.query(`
      ALTER TABLE score DROP CONSTRAINT IF EXISTS "score_quiz_score_check";
    `);

    // Add the new constraint without max limit (for survival mode unlimited scores)
    await queryInterface.sequelize.query(`
      ALTER TABLE score ADD CONSTRAINT "score_quiz_score_check" 
      CHECK (quiz_score >= 0);
    `);
  },

  async down (queryInterface, Sequelize) {
    // Drop the new constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE score DROP CONSTRAINT IF EXISTS "score_quiz_mode_check";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE score DROP CONSTRAINT IF EXISTS "score_quiz_score_check";
    `);

    // Restore the original constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE score ADD CONSTRAINT "score_quiz_mode_check" 
      CHECK (quiz_mode IN ('daily', 'blitz', 'category'));
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE score ADD CONSTRAINT "score_quiz_score_check" 
      CHECK (quiz_score >= 0 AND quiz_score <= 10);
    `);
  }
};
