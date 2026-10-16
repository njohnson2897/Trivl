import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    shareScores: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    showOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "light",
      validate: {
        isIn: [["light", "dark"]],
      },
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    soundEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
      validate: {
        isIn: [["easy", "medium", "hard"]],
      },
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "english",
      validate: {
        isIn: [["english", "spanish", "french", "german"]],
      },
    },
    lastQuizDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "user",
    // Never load the password hash unless a query explicitly asks for it.
    // This also applies when User is included in another model's query.
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      // Only for login, which has to compare against the stored hash.
      withPassword: {
        attributes: { include: ["password"] },
      },
    },
  }
);

export default User;
