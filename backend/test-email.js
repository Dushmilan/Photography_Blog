import dotenv from 'dotenv';
import EmailService from './utils/emailService.js';

dotenv.config();

const emailService = new EmailService();

async function testConnection() {
  console.log('Testing email connection...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');

  const isConnected = await emailService.verifyConnection();
  if (isConnected) {
    console.log('SUCCESS: Email service is connected and ready to send emails.');
  } else {
    console.log('FAILURE: Could not connect to the email service. Check your credentials and SMTP settings.');
  }
}

testConnection();
