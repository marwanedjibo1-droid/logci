const db = require('../database/config');

exports.addPayment = async (req, res, next) => {
  try {
    const { invoice_id, amount, date, method, notes } = req.body;
    
    const query = `
      INSERT INTO payments (invoice_id, amount, date, method, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [invoice_id, amount, date, method, notes]);
    
    // Update invoice paid_amount and status
    const updateQuery = `
      UPDATE invoices 
      SET paid_amount = paid_amount + $1,
          status = CASE 
            WHEN paid_amount + $1 >= total THEN 'paid'
            WHEN paid_amount + $1 > 0 THEN 'partial'
            ELSE status
          END
      WHERE id = $2
      RETURNING *
    `;
    
    await db.query(updateQuery, [amount, invoice_id]);
    
    res.status(201).json({
      success: true,
      message: 'Paiement ajouté avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentsByInvoice = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM payments WHERE invoice_id = $1 ORDER BY date DESC';
    const result = await db.query(query, [req.params.invoiceId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
