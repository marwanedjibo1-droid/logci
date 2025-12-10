const db = require('../database/config');

class Invoice {
  static async create(userId, invoiceData) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { client_id, number, date, due_date, items, subtotal, tax_rate, tax_amount, total, notes, status = 'unpaid' } = invoiceData;
      
      // Insert invoice
      const invoiceQuery = `
        INSERT INTO invoices (user_id, client_id, number, date, due_date, subtotal, tax_rate, tax_amount, total, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const invoiceResult = await client.query(invoiceQuery, [
        userId, client_id, number, date, due_date, subtotal, tax_rate, tax_amount, total, notes, status
      ]);
      
      const invoice = invoiceResult.rows[0];
      
      // Insert invoice items
      if (items && items.length > 0) {
        const itemQuery = `
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, discount, total)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        
        for (const item of items) {
          await client.query(itemQuery, [
            invoice.id,
            item.description,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.total
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch complete invoice with items
      return await this.findById(invoice.id, userId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id, userId) {
    const query = `
      SELECT i.*,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        json_agg(
          json_build_object(
            'id', ii.id,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'discount', ii.discount,
            'total', ii.total
          )
        ) FILTER (WHERE ii.id IS NOT NULL) as items,
        json_agg(
          json_build_object(
            'id', p.id,
            'amount', p.amount,
            'date', p.date,
            'method', p.method,
            'notes', p.notes
          )
        ) FILTER (WHERE p.id IS NOT NULL) as payments
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      LEFT JOIN payments p ON i.id = p.invoice_id
      WHERE i.id = $1 AND i.user_id = $2
      GROUP BY i.id, c.name, c.phone, c.email
    `;
    
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findAll(userId, { status, client_id, date_from, date_to, search, limit = 100, offset = 0 } = {}) {
    let query = `
      SELECT i.*,
        c.name as client_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as items_count,
        (SELECT COUNT(*) FROM payments WHERE invoice_id = i.id) as payments_count
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ` AND i.status = $${params.length + 1}`;
      params.push(status);
    }
    
    if (client_id) {
      query += ` AND i.client_id = $${params.length + 1}`;
      params.push(client_id);
    }
    
    if (date_from) {
      query += ` AND i.date >= $${params.length + 1}`;
      params.push(date_from);
    }
    
    if (date_to) {
      query += ` AND i.date <= $${params.length + 1}`;
      params.push(date_to);
    }
    
    if (search) {
      query += ` AND (i.number ILIKE $${params.length + 1} OR c.name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY i.date DESC, i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async update(id, userId, updateData) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { date, due_date, items, subtotal, tax_rate, tax_amount, total, notes, status } = updateData;
      
      // Update invoice
      const invoiceQuery = `
        UPDATE invoices 
        SET date = COALESCE($1, date),
            due_date = COALESCE($2, due_date),
            subtotal = COALESCE($3, subtotal),
            tax_rate = COALESCE($4, tax_rate),
            tax_amount = COALESCE($5, tax_amount),
            total = COALESCE($6, total),
            notes = COALESCE($7, notes),
            status = COALESCE($8, status)
        WHERE id = $9 AND user_id = $10
        RETURNING *
      `;
      
      await client.query(invoiceQuery, [
        date, due_date, subtotal, tax_rate, tax_amount, total, notes, status, id, userId
      ]);
      
      // Update items if provided
      if (items) {
        // Delete existing items
        await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
        
        // Insert new items
        const itemQuery = `
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, discount, total)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        for (const item of items) {
          await client.query(itemQuery, [
            id,
            item.description,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.total
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      return await this.findById(id, userId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async getStats(userId, { period = 'month' } = {}) {
    let dateFilter = '';
    
    if (period === 'today') {
      dateFilter = "AND date = CURRENT_DATE";
    } else if (period === 'week') {
      dateFilter = "AND date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND date >= date_trunc('month', CURRENT_DATE)";
    } else if (period === 'year') {
      dateFilter = "AND date >= date_trunc('year', CURRENT_DATE)";
    }
    
    const query = `
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(total - paid_amount), 0) as unpaid_amount,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COUNT(*) FILTER (WHERE status = 'unpaid') as unpaid_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'partial') as partial_count,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'paid') as overdue_count
      FROM invoices
      WHERE user_id = $1 ${dateFilter}
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async getNextNumber(userId) {
    const query = 'SELECT invoice_number, invoice_prefix FROM settings WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows.length > 0) {
      const { invoice_number, invoice_prefix } = result.rows[0];
      return `${invoice_prefix}${String(invoice_number).padStart(6, '0')}`;
    }
    
    return 'F-000001';
  }

  static async incrementNumber(userId) {
    const query = 'UPDATE settings SET invoice_number = invoice_number + 1 WHERE user_id = $1';
    await db.query(query, [userId]);
  }
}

module.exports = Invoice;
