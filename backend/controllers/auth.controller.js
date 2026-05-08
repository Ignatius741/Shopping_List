const jwt = require('jsonwebtoken');
const UserModel = require('../models/User.model');

class AuthController {
  static async register(req, res) {
    try {
      const { username, password } = req.body;
      
      console.log('Registration attempt:', username);
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }
      
      if (password.length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters' });
      }

      const newUser = await UserModel.create(username, password);
      
      console.log('User created successfully:', username);
      
      res.status(201).json({
        message: 'User created successfully',
        userId: newUser.id,
        username: newUser.username
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      console.log('Login attempt:', username);
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await UserModel.validatePassword(password, user.password);
      if (!isValid) {
        console.log('Invalid password for:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'fallback_secret_key_change_me',
        { expiresIn: '7d' }
      );

      console.log('Login successful:', username);
      
      res.json({
        message: 'Login successful',
        token,
        userId: user.id,
        username: user.username
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async verify(req, res) {
    res.json({ valid: true, userId: req.userId, username: req.username });
  }
}

module.exports = AuthController;