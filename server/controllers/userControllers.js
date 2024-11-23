import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register controller - POST
export const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await User.create({ username, password: hashedPassword });
    
    // Sign a JWT for the new user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Return user info (without password) and the token
    res.status(201).json({ 
      user: { id: user.id, username: user.username }, 
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// Login controller - POST
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Compare provided password with stored hash
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Return user info (without password) and the token
    res.json({ 
      user: { id: user.id, username: user.username }, 
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// GET all users
export const getUsers = async (req, res) => {
  try {
      const users = await User.findAll();
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error fetching user' });
  }
};
