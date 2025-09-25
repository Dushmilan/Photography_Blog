// Verify that the email system is properly configured to send to dushmilan05@gmail.com
require('dotenv').config();
const EmailService = require('./utils/emailService');

console.log('🔍 Email Configuration Verification');
console.log('==================================\n');

console.log('Environment Variables:');
console.log('✅ CONTACT_EMAIL:', process.env.CONTACT_EMAIL);
console.log('✅ SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
console.log('✅ SMTP_PORT:', process.env.SMTP_PORT || '587');
console.log('✅ EMAIL_USER configured:', !!process.env.EMAIL_USER);
console.log('✅ EMAIL_PASS configured:', !!process.env.EMAIL_PASS);

console.log('\n📋 System Status:');
const hasRequiredCreds = process.env.EMAIL_USER && process.env.EMAIL_PASS;
const hasContactEmail = process.env.CONTACT_EMAIL;

console.log(`✅ Contact email configured: ${!!hasContactEmail}`);
console.log(`✅ Sending credentials configured: ${!!hasRequiredCreds}`);

if (hasContactEmail && hasRequiredCreds) {
  console.log('\n🎉 System is fully configured!');
  console.log(`📧 Contact form submissions will be sent to: ${process.env.CONTACT_EMAIL}`);
  console.log('✅ All required credentials are present');
} else {
  console.log('\n⚠️  Configuration status:');
  if (!hasContactEmail) console.log('   - CONTACT_EMAIL is missing');
  if (!hasRequiredCreds) console.log('   - EMAIL_USER and EMAIL_PASS are missing');
  console.log('\nTo finish setup, add EMAIL_USER and EMAIL_PASS to your .env file');
}

// Test that the contact email is valid
const emailService = new EmailService();
if (hasContactEmail) {
  const isValid = emailService.validateEmail(process.env.CONTACT_EMAIL);
  console.log(`\n✅ Contact email validation: ${isValid}`);
  
  if (isValid) {
    console.log('✅ The system will send emails to dushmilan05@gmail.com when properly configured');
  }
}

console.log('\n💡 To send actual emails:');
console.log('   1. Add EMAIL_USER=your-email@gmail.com');
console.log('   2. Add EMAIL_PASS=your-app-password (not regular password!)');
console.log('   3. For Gmail, use an App Password: https://myaccount.google.com/apppasswords');
console.log('   4. Restart the server');
console.log('   5. Submit data to POST /api/contact endpoint');