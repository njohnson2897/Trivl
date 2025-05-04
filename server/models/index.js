import User from "./User.js";
import Score from "./Score.js";
import UserFriends from "./UserFriends.js";
import Achievement from "./Achievement.js";

// Define relationships
Score.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(Score, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

// Achievement relationships
Achievement.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(Achievement, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

// Self-referential many-to-many relationship for friends
User.belongsToMany(User, {
  through: UserFriends,
  as: "friends",
  foreignKey: "userId",
  otherKey: "friendId",
});

// Associate UserFriends with User for the userId relationship
UserFriends.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // This matches the alias you're using in your query
});

// Associate UserFriends with User for the friendId relationship
UserFriends.belongsTo(User, {
  foreignKey: "friendId",
  as: "friend",
});

// Export models
export { User, Score, UserFriends, Achievement };
