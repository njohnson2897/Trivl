import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connection.js';

class UserFriends extends Model {}

UserFriends.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user', // References the User table
        key: 'id',
      },
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user', // References the User table
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user_friends',
  }
);

export default UserFriends;