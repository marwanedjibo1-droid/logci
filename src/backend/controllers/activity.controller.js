const db = require('../database/config');

exports.getActivities = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const query = `
      SELECT * FROM activities 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await db.query(query, [req.user.id, limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
