const express = require('express');
const router = express.Router();
const { getDefaultBranch, updateDefaultBranch } = require('../controllers/branchController');
const { protect } = require('../middleware/auth');

// Get default branch
router.get('/default', getDefaultBranch);

// Update default branch
router.put('/default', protect, updateDefaultBranch);

module.exports = router; 