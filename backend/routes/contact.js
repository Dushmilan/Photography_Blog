const express = require('express');
const EmailService = require('../utils/emailService');

const router = express.Router();
const emailService = new EmailService();

// Contact form endpoint
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required fields' 
      });
    }

    // Validate email format
    if (!emailService.validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if recipient email is configured
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
    if (!recipientEmail) {
      return res.status(500).json({ 
        success: false, 
        message: 'Contact email configuration not set up' 
      });
    }

    // Set a default subject if none provided
    const emailSubject = subject || `Contact from ${name} via Photography Portfolio`;

    // Send the email
    const result = await emailService.sendContactEmail(
      recipientEmail,
      emailSubject,
      message,
      name,
      email
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
});

module.exports = router;