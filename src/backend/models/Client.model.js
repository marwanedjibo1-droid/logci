const db = require('../database/config');

class Client {
  static async create(userId, { name, phone, email, address, notes }) {
    const query = `
      INSERT INTO clients (user_id, name, phone, email, address, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [userId, name, phone, email, address, notes]);
    return result.rows[0];
  }

  static async findById(id, userId) {
    const query = 'SELECT * FROM clients WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findAll(userId, { search, limit = 100, offset = 0 } = {}) {
    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM invoices WHERE client_id = c.id) as invoice_count,
        (SELECT COALESCE(SUM(total - paid_amount), 0) FROM invoices WHERE client_id = c.id AND status != 'paid') as unpaid_amount
      FROM clients c
      WHERE c.user_id = $1 AND c.is_active = true
    `;
    
    const params = [userId];
    
    if (search) {
      query += ` AND (c.name ILIKE $${params.length + 1} OR c.phone ILIKE $${params.length + 1} OR c.email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async update(id, userId, { name, phone, email, address, notes, is_active }) {
    const query = `
      UPDATE clients 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          address = COALESCE($4, address),
          notes = COALESCE($5, notes),
          is_active = COALESCE($6, is_active)
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    
    const result = await db.query(query, [name, phone, email, address, notes, is_active, id, userId]);
    return result.rows[0];
  }

  static async delete(id, userId) {
    // Check if client has invoices
    const checkQuery = 'SELECT COUNT(*) as count FROM invoices WHERE client_id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete client with existing invoices');
    }
    
    const query = 'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month,
        (SELECT COUNT(DISTINCT client_id) FROM invoices WHERE user_id = $1) as clients_with_invoices
      FROM clients
      WHERE user_id = $1 AND is_active = true
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Client;
