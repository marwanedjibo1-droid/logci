const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
} = require('../controllers/client.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

// Validation rules
const clientValidation = [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('phone').notEmpty().withMessage('Le téléphone est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
];

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getClients)
  .post(clientValidation, validate, createClient);

router.get('/stats', getClientStats);

router.route('/:id')
  .get(getClient)
  .put(clientValidation, validate, updateClient)
  .delete(deleteClient);

module.exports = router;
