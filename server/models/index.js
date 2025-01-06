import User from './User.js';
import Score from './Score.js';

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
    through: 'UserFriends',
    as: 'friends', // Alias for the relationship
    foreignKey: 'userId',
    otherKey: 'friendId',
  });

export default {
    User,
    Score
}