const User = require('../models/User.model');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.update(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.delete(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    next(error);
  }
};
