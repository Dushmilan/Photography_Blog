// Test email functionality with example data
require('dotenv').config();
const EmailService = require('./utils/emailService');

async function demonstrateEmailProcess() {
  console.log('📧 Email Functionality Demonstration\n');
  
  // Create email service instance
  const emailService = new EmailService();
  
  console.log('✅ Email service initialized');
  console.log('✅ Validating destination email...');
  
  // Validate the CONTACT_EMAIL from environment
  const contactEmail = process.env.CONTACT_EMAIL;
  const isValid = emailService.validateEmail(contactEmail);
  
  console.log(`   CONTACT_EMAIL: ${contactEmail}`);
  console.log(`   Is valid: ${isValid}`);
  
  if (!isValid) {
    console.log('❌ Invalid email address in CONTACT_EMAIL');
    return;
  }
  
  console.log('\n📝 Creating formatted email content...');
  
  // Format a sample message
  const formatted = emailService.formatContactEmail(
    'Hello! This is a test message from the photography portfolio contact form.\n\nThe website is working perfectly and ready to receive messages from visitors.\n\nBest regards,\nPhotography Portfolio System',
    'Website Visitor',
    'visitor@example.com'
  );
  
  console.log('✅ Email formatted successfully');
  console.log(`   Text version length: ${formatted.text.length} characters`);
  console.log(`   HTML version length: ${formatted.html.length} characters`);
  
  console.log('\n📋 Email content preview:');
  console.log('   Subject: Test Contact Form Message');
  console.log('   From: Website Visitor (visitor@example.com)');
  console.log('   To:', contactEmail);
  console.log('   Message: [See full content above]');
  
  console.log('\n🔐 Email sending requirements:');
  console.log('   - EMAIL_USER: ' + (process.env.EMAIL_USER ? 'CONFIGURED' : 'MISSING'));
  console.log('   - EMAIL_PASS: ' + (process.env.EMAIL_PASS ? 'CONFIGURED' : 'MISSING'));
  console.log('   - SMTP_HOST: ' + (process.env.SMTP_HOST || 'smtp.gmail.com'));
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('\n🚀 Ready to send email! Call sendContactEmail() with proper credentials.');
  } else {
    console.log('\n⚠️  To send actual emails, configure EMAIL_USER and EMAIL_PASS in your .env file.');
    console.log('   For testing, visit https://ethereal.email/ to get free test email credentials.');
  }
  
  console.log('\n📋 Steps to configure real email sending:');
  console.log('   1. Add EMAIL_USER (your email address)');
  console.log('   2. Add EMAIL_PASS (your app password)');
  console.log('   3. Optionally configure SMTP_HOST and SMTP_PORT');
  console.log('   4. Restart the server');
  console.log('   5. Send a POST request to /api/contact with name, email, and message');
}

demonstrateEmailProcess();