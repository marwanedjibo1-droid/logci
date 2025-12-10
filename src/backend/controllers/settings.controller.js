const db = require('../database/config');

exports.getSettings = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM settings WHERE user_id = $1';
    const result = await db.query(query, [req.user.id]);
    
    res.json({
      success: true,
      data: result.rows[0] || {}
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const fields = req.body;
    const query = `
      INSERT INTO settings (user_id, ${Object.keys(fields).join(', ')})
      VALUES ($1, ${Object.keys(fields).map((_, i) => `$${i + 2}`).join(', ')})
      ON CONFLICT (user_id) 
      DO UPDATE SET ${Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ')}
      RETURNING *
    `;
    
    const result = await db.query(query, [req.user.id, ...Object.values(fields)]);
    
    res.json({
      success: true,
      message: 'Paramètres mis à jour',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
