const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  setDefaultTemplate
} = require('../controllers/whatsappTemplateController');

// Get all templates
router.get('/', getTemplates);

// Create new template
router.post('/', protect, createTemplate);

// Set default template - This needs to come BEFORE the /:id route
router.put('/set-default', protect, setDefaultTemplate);

// Update template
router.put('/:id', protect, updateTemplate);

module.exports = router; 