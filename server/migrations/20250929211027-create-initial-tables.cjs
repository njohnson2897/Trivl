"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      share_scores: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      show_online: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      theme: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "light",
      },
      notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      email_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sound_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      difficulty: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "medium",
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "english",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create scores table
    await queryInterface.createTable("scores", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      quiz_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quiz_difficulty: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categories: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      is_niche: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      time_taken: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_taken: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    // Create achievements table
    await queryInterface.createTable("achievements", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      criteria: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow null for template achievements
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      date_achieved: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create user_friends table
    await queryInterface.createTable("user_friends", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      friend_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "blocked"),
        defaultValue: "pending",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("scores", ["user_id"]);
    await queryInterface.addIndex("achievements", ["user_id"]);
    await queryInterface.addIndex("user_friends", ["user_id"]);
    await queryInterface.addIndex("user_friends", ["friend_id"]);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (due to foreign key constraints)
    await queryInterface.dropTable("user_friends");
    await queryInterface.dropTable("achievements");
    await queryInterface.dropTable("scores");
    await queryInterface.dropTable("users");
  },
};
