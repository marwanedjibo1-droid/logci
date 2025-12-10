const Client = require('../models/Client.model');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res, next) => {
  try {
    const { search, limit, offset } = req.query;
    
    const clients = await Client.findAll(req.user.id, {
      search,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });
    
    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id, req.user.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client introuvable'
      });
    }
    
    res.json({
      success: true,
      data: client
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res, next) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    
    const client = await Client.create(req.user.id, {
      name,
      phone,
      email,
      address,
      notes
    });
    
    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: client
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res, next) => {
  try {
    const { name, phone, email, address, notes, is_active } = req.body;
    
    const client = await Client.update(req.params.id, req.user.id, {
      name,
      phone,
      email,
      address,
      notes,
      is_active
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client introuvable'
      });
    }
    
    res.json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: client
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.delete(req.params.id, req.user.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client introuvable'
      });
    }
    
    res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
    
  } catch (error) {
    if (error.message.includes('existing invoices')) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un client avec des factures existantes'
      });
    }
    next(error);
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private
exports.getClientStats = async (req, res, next) => {
  try {
    const stats = await Client.getStats(req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
};
