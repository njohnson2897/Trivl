"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the incorrect foreign key constraints that point to 'users' table
    await queryInterface.removeConstraint(
      "user_friends",
      "user_friends_user_id_fkey"
    );
    await queryInterface.removeConstraint(
      "user_friends",
      "user_friends_friend_id_fkey"
    );

    // Add the correct foreign key constraints pointing to 'user' table
    await queryInterface.addConstraint("user_friends", {
      fields: ["user_id"],
      type: "foreign key",
      name: "user_friends_user_id_fkey",
      references: {
        table: "user",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("user_friends", {
      fields: ["friend_id"],
      type: "foreign key",
      name: "user_friends_friend_id_fkey",
      references: {
        table: "user",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the correct foreign key constraints
    await queryInterface.removeConstraint(
      "user_friends",
      "user_friends_user_id_fkey"
    );
    await queryInterface.removeConstraint(
      "user_friends",
      "user_friends_friend_id_fkey"
    );

    // Restore the original (incorrect) foreign key constraints pointing to 'users' table
    await queryInterface.addConstraint("user_friends", {
      fields: ["user_id"],
      type: "foreign key",
      name: "user_friends_user_id_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("user_friends", {
      fields: ["friend_id"],
      type: "foreign key",
      name: "user_friends_friend_id_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },
};
