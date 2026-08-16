const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('// EMAIL_CREDENTIALS_MISSING - SKIP SENDING');
      return;
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `Awaastech Society System <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Support for professional HTML templates
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('// EMAIL_SENT_SUCCESS:', info.messageId);
  } catch (error) {
    console.error('// EMAIL_SEND_ERROR:', error.message);
  }
};

module.exports = sendEmail;
