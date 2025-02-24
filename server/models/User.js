import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connection.js';
import UserFriends from './UserFriends.js'; // Import the join table model

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
    modelName: 'user',
  }
);

// Define the many-to-many relationship
User.belongsToMany(User, {
  through: UserFriends, // Use the join table
  as: 'friends', // Alias for the relationship
  foreignKey: 'userId', // Foreign key in the join table
  otherKey: 'friendId', // Foreign key for the friend in the join table
});

export default User;