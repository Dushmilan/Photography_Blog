const express = require('express');
const EmailService = require('../utils/emailService');
const { catchAsync, AppError } = require('../utils/errorHandler');

const router = express.Router();
const emailService = new EmailService();

// Contact form endpoint
router.post('/contact', catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    throw new AppError('Name, email, and message are required fields', 400);
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof subject !== 'string' || typeof message !== 'string') {
    throw new AppError('All fields must be strings', 400);
  }

  // Validate email format
  if (!emailService.validateEmail(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  // Validate field lengths
  if (name.length > 100) {
    throw new AppError('Name must be less than 100 characters', 400);
  }
  if (email.length > 254) {
    throw new AppError('Email must be less than 254 characters', 400);
  }
  if (subject && subject.length > 200) {
    throw new AppError('Subject must be less than 200 characters', 400);
  }
  if (message.length > 1000) {
    throw new AppError('Message must be less than 1000 characters', 400);
  }

  // Check if recipient email is configured
  const recipientEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  if (!recipientEmail) {
    throw new AppError('Contact email configuration not set up', 500);
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
    throw new AppError('Failed to send message', 500);
  }
}));

export default router;