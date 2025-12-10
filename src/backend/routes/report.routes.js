const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);

module.exports = router;
