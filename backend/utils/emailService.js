const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create a transporter for sending emails
    // Using environment variables for email configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Sends a contact email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} message - Email message content
   * @param {string} fromName - Sender's name (optional)
   * @param {string} fromEmail - Sender's email (optional)
   * @returns {Promise<Object>} - Result of the email sending operation
   */
  async sendContactEmail(to, subject, message, fromName = 'Photography Portfolio Visitor', fromEmail = null) {
    try {
      // Validate required parameters
      if (!to || !subject || !message) {
        throw new Error('Missing required parameters: to, subject, or message');
      }

      // Prepare the email content with a standardized format
      const formattedMessage = this.formatContactEmail(message, fromName, fromEmail);

      // Define email options
      const mailOptions = {
        from: fromEmail ? `"${fromName}" <${fromEmail}>` : `"${fromName}" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: formattedMessage.text,
        html: formattedMessage.html
      };

      // Send the email
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  /**
   * Formats the contact email with a standardized layout
   * @param {string} message - The original message
   * @param {string} fromName - Sender's name
   * @param {string} fromEmail - Sender's email
   * @returns {Object} - Formatted email content with both text and HTML versions
   */
  formatContactEmail(message, fromName, fromEmail) {
    const timestamp = new Date().toLocaleString();
    
    const textContent = `
Contact Message from Photography Portfolio

From: ${fromName}${fromEmail ? ` (${fromEmail})` : ''}
Date: ${timestamp}

Message:
${message}

---
This email was sent through the contact form on your photography portfolio website.
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Contact Message from Photography Portfolio</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f8f8; padding: 15px; text-align: center; }
    .content { padding: 20px 0; }
    .footer { background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 0.9em; }
    .info { background-color: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 3px solid #ccc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Contact Message from Photography Portfolio</h2>
    </div>
    <div class="content">
      <div class="info">
        <strong>From:</strong> ${fromName}${fromEmail ? `<br><strong>Email:</strong> ${fromEmail}` : ''}
      </div>
      <div class="info">
        <strong>Date:</strong> ${timestamp}
      </div>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
    <div class="footer">
      <p>This email was sent through the contact form on your photography portfolio website.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      text: textContent,
      html: htmlContent
    };
  }

  /**
   * Validates email address format
   * @param {string} email - Email address to validate
   * @returns {boolean} - True if email is valid, false otherwise
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verifies the transporter configuration
   * @returns {Promise<boolean>} - True if configuration is valid, false otherwise
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service configuration verified');
      return true;
    } catch (error) {
      console.error('Email service configuration error:', error);
      return false;
    }
  }
}

export default EmailService;