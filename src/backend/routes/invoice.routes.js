const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  getNextInvoiceNumber
} = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

// Validation rules
const invoiceValidation = [
  body('client_id').notEmpty().withMessage('Le client est requis'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('due_date').isISO8601().withMessage('Date d\'échéance invalide'),
  body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Sous-total invalide'),
  body('total').isFloat({ min: 0 }).withMessage('Total invalide'),
];

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getInvoices)
  .post(invoiceValidation, validate, createInvoice);

router.get('/stats', getInvoiceStats);
router.get('/next-number', getNextInvoiceNumber);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

module.exports = router;
