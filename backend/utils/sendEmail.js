const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('// EMAIL_CREDENTIALS_MISSING - SKIP SENDING');
      return;
    }
    
    const mailOptions = {
      from: `Awaastech Society System <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Support for professional HTML templates
    };

    const info = await getTransporter().sendMail(mailOptions);
    logger.info(`// EMAIL_SENT_SUCCESS: ${info.messageId}`);
  } catch (error) {
    logger.error('// EMAIL_SEND_ERROR:', error.message);
  }
};

module.exports = sendEmail;
