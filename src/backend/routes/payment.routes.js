const express = require('express');
const router = express.Router();
const { addPayment, getPaymentsByInvoice } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', addPayment);
router.get('/invoice/:invoiceId', getPaymentsByInvoice);

module.exports = router;
