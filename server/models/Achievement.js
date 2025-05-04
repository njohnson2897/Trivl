import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

class Achievement extends Model {}

Achievement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    criteria: {
      type: DataTypes.JSON,
      allowNull: false,
      // Stores the conditions needed to unlock the achievement
      // Example: { type: 'score', value: 10 } or { type: 'games_played', value: 5 }
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
      // Stores the icon name/identifier for the achievement
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    date_achieved: {
      type: DataTypes.DATE,
      allowNull: true,
      // Will be null until the achievement is unlocked
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "achievement",
  }
);

export default Achievement;
