import User from './User.js';
import Score from './Score.js';
import UserFriends from './UserFriends.js';

// Define relationships
Score.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

User.hasMany(Score, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

// Self-referential many-to-many relationship for friends
User.belongsToMany(User, {
  through: UserFriends,
  as: 'friends',
  foreignKey: 'userId',
  otherKey: 'friendId',
});

export default {
  User,
  Score,
  UserFriends,
};