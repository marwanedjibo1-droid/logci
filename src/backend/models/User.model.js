const db = require('../database/config');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, is_active, created_at
    `;
    
    const result = await db.query(query, [email, hashedPassword, name, role]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async update(id, { name, role, is_active }) {
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          role = COALESCE($2, role),
          is_active = COALESCE($3, is_active)
      WHERE id = $4
      RETURNING id, email, name, role, is_active, created_at
    `;
    
    const result = await db.query(query, [name, role, is_active, id]);
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await db.query(query, [hashedPassword, id]);
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await db.query(query, [id]);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
