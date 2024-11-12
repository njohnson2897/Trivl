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

export default {
    User,
    Score
}