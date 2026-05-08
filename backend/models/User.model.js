const bcrypt = require('bcryptjs');
const { findUserByUsername, findUserById, saveUser } = require('../utils/helpers');

class UserModel {
  static async findByUsername(username) {
    return findUserByUsername(username);
  }

  static async findById(id) {
    return findUserById(id);
  }

  static async create(username, plainPassword) {
    const existing = await this.findByUsername(username);
    if (existing) throw new Error('Username already exists');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Password hashed for:', username);
    
    const newUser = {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    return saveUser(newUser);
  }

  static async validatePassword(plainPassword, hashedPassword) {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password validation result:', isValid);
    return isValid;
  }
}

module.exports = UserModel;