// User model for Supabase/PostgreSQL
const Database = require('../utils/db');
const { AppError } = require('../utils/errorHandler');

class User {
  constructor(supabase) {
    this.db = new Database(supabase);
  }

  async create(userData) {
    if (!userData) {
      throw new AppError('User data is required for creating a user', 400);
    }

    return await this.db.createUser(userData);
  }

  async findById(userId) {
    if (!userId) {
      throw new AppError('User ID is required for finding user by ID', 400);
    }

    return await this.db.findUserById(userId);
  }

  async findByUsername(username) {
    if (!username) {
      throw new AppError('Username is required for finding user by username', 400);
    }

    return await this.db.findUserByUsername(username);
  }
}

export default User;