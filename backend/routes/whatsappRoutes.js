const express = require('express');
const router = express.Router();
const { handleWhatsAppMessage } = require('../controllers/whatsappWebhookController');

// Public webhook endpoint for WhatsApp (Twilio / Meta Cloud API or UI simulator)
router.post('/whatsapp', handleWhatsAppMessage);

module.exports = router;
