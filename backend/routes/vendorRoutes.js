const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectDetails, submitQuote, analyzeQuotes } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware'); 
const validateRequest = require('../middleware/validateRequest');
const { createProjectSchema, submitQuoteSchema } = require('../validations/schemas');

// Admin routes
router.post('/projects', protect, validateRequest(createProjectSchema), createProject);
router.get('/projects', protect, getProjects);
router.get('/projects/:id', protect, getProjectDetails);
router.post('/projects/:projectId/analyze', protect, analyzeQuotes);

// Public vendor route
router.get('/projects/:projectId/public', require('../controllers/vendorController').getProjectPublicDetails);
router.post('/projects/:projectId/quote', validateRequest(submitQuoteSchema), submitQuote);

module.exports = router;
