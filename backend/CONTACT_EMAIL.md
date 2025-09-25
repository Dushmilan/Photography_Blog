# Contact Email Functionality

## Overview
The photography portfolio website includes a contact form that allows visitors to send emails directly to the photographer through the website. This functionality is implemented using nodemailer for sending emails.

## Email Format

### Standardized Layout
When a visitor submits the contact form, the email is formatted with the following structure:

**Text Version:**
```
Contact Message from Photography Portfolio

From: [Visitor's Name] ([Visitor's Email])
Date: [Timestamp]

Message:
[Visitor's message content]

---
This email was sent through the contact form on your photography portfolio website.
```

**HTML Version:**
- Header with "Contact Message from Photography Portfolio"
- Information section showing sender details (name and email)
- Timestamp of when the message was sent
- Formatted message content with proper line breaks
- Footer with system information

## Required Environment Variables
To use the contact email functionality, you need to set up the following environment variables in your `.env` file:

```env
# Email configuration
SMTP_HOST=smtp.gmail.com              # SMTP server host (default: smtp.gmail.com)
SMTP_PORT=587                         # SMTP server port (default: 587)
EMAIL_USER=your-email@gmail.com       # Your email address
EMAIL_PASS=your-app-password          # Your email app password
CONTACT_EMAIL=recipient@domain.com    # Where to send contact form submissions (optional, defaults to EMAIL_USER)
```

For Gmail users, you'll need to use an "App Password" instead of your regular password. Follow these steps:
1. Enable 2-Factor Authentication on your Google account
2. Go to your Google Account settings
3. Navigate to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Use this app password in the EMAIL_PASS environment variable

## API Endpoint
The contact form sends POST requests to:
- **URL**: `/api/contact`
- **Method**: POST
- **Required Fields**:
  - `name` (string): Visitor's name
  - `email` (string): Visitor's email address (must be valid)
  - `message` (string): The message content
- **Optional Fields**:
  - `subject` (string): Subject line (defaults to "Contact from [Name] via Photography Portfolio")

## Response Format
Successful submission returns:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "messageId": "[email message ID]"
}
```

Error response returns:
```json
{
  "success": false,
  "message": "Error description",
  "error": "[error details - only in some cases]"
}
```

## Security Features
- Email validation to ensure proper format
- Rate limiting (if configured globally)
- Input sanitization
- Secure SMTP configuration