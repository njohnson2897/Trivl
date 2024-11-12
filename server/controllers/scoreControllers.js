import Score from '../models/Score.js';
import User from '../models/User.js';

export const logScore = async (req, res) => {
        try {
            const { userId, quiz_score } = req.body;

            // Check if user exists
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Create a new score entry
            const newScore = await Score.create({
                user_id: userId,
                quiz_score,
            });

            res.status(201).json(newScore);
        } catch (error) {
            console.error('Error logging score:', error);
            res.status(500).json({ error: 'Error logging score' });
        }
    };

