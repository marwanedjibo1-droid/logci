const db = require('../database/config');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(total - paid_amount), 0) as unpaid_amount,
        COUNT(*) FILTER (WHERE date = CURRENT_DATE) as today_invoices,
        COALESCE(SUM(total) FILTER (WHERE date = CURRENT_DATE), 0) as today_sales,
        COUNT(*) FILTER (WHERE date >= date_trunc('month', CURRENT_DATE)) as month_invoices,
        COALESCE(SUM(total) FILTER (WHERE date >= date_trunc('month', CURRENT_DATE)), 0) as month_sales
      FROM invoices
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const { period = 'month', date_from, date_to } = req.query;
    
    let dateFilter = '';
    if (date_from && date_to) {
      dateFilter = `AND date BETWEEN '${date_from}' AND '${date_to}'`;
    } else if (period === 'week') {
      dateFilter = "AND date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND date >= date_trunc('month', CURRENT_DATE)";
    }
    
    const query = `
      SELECT 
        date,
        COUNT(*) as invoice_count,
        SUM(total) as total_sales,
        SUM(paid_amount) as paid_amount
      FROM invoices
      WHERE user_id = $1 ${dateFilter}
      GROUP BY date
      ORDER BY date DESC
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
