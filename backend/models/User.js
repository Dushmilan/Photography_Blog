// User model for Supabase/PostgreSQL
const Database = require('../utils/db');

class User {
  constructor(supabase) {
    this.db = new Database(supabase);
  }

  async create(userData) {
    return await this.db.createUser(userData);
  }

  async findById(userId) {
    return await this.db.findUserById(userId);
  }

  async findByUsername(username) {
    return await this.db.findUserByUsername(username);
  }
}

module.exports = User;