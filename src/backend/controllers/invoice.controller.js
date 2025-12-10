const Invoice = require('../models/Invoice.model');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res, next) => {
  try {
    const { status, client_id, date_from, date_to, search, limit, offset } = req.query;
    
    const invoices = await Invoice.findAll(req.user.id, {
      status,
      client_id,
      date_from,
      date_to,
      search,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });
    
    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id, req.user.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture introuvable'
      });
    }
    
    res.json({
      success: true,
      data: invoice
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res, next) => {
  try {
    // Get next invoice number
    const number = await Invoice.getNextNumber(req.user.id);
    
    const invoice = await Invoice.create(req.user.id, {
      ...req.body,
      number
    });
    
    // Increment invoice number
    await Invoice.incrementNumber(req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: invoice
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.update(req.params.id, req.user.id, req.body);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture introuvable'
      });
    }
    
    res.json({
      success: true,
      message: 'Facture mise à jour avec succès',
      data: invoice
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.delete(req.params.id, req.user.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture introuvable'
      });
    }
    
    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoiceStats = async (req, res, next) => {
  try {
    const { period } = req.query;
    
    const stats = await Invoice.getStats(req.user.id, { period });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get next invoice number
// @route   GET /api/invoices/next-number
// @access  Private
exports.getNextInvoiceNumber = async (req, res, next) => {
  try {
    const number = await Invoice.getNextNumber(req.user.id);
    
    res.json({
      success: true,
      data: { number }
    });
    
  } catch (error) {
    next(error);
  }
};
