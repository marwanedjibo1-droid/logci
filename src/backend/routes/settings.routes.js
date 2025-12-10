const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getSettings).put(updateSettings);

module.exports = router;
