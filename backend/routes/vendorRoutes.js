const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectDetails, submitQuote, analyzeQuotes } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createProjectSchema, submitQuoteSchema } = require('../validations/schemas');

// Admin-only: create projects and run AI quote analysis
router.post('/projects', protect, hasPermission('manage:vendors'), validateRequest(createProjectSchema), createProject);
router.post('/projects/:projectId/analyze', protect, hasPermission('manage:vendors'), analyzeQuotes);

// Any authenticated user with 'read:vendors' can view projects
router.get('/projects', protect, hasPermission('read:vendors'), getProjects);
router.get('/projects/:id', protect, hasPermission('read:vendors'), getProjectDetails);

// Public vendor routes — no auth required (vendors submit from external portal)
router.get('/projects/:projectId/public', require('../controllers/vendorController').getProjectPublicDetails);
router.post('/projects/:projectId/quote', validateRequest(submitQuoteSchema), submitQuote);

module.exports = router;
