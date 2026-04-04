// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTeacherApprovalEmail = async (email, name, tempPassword) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const mailOptions = {
    from: `"interaAI" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your Teacher Account Has Been Approved - interaAI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .credential-item { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .button:hover { background: #ea580c; }
          .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to interaAI!</h1>
            <p>Your teacher account has been approved</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Congratulations! Your teacher registration has been approved by our admin team. You can now access your teacher dashboard and start creating aptitude tests.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #f97316;">Your Login Credentials</h3>
              
              <div class="credential-item">
                <strong>Email:</strong> ${email}
              </div>
              
              <div class="credential-item">
                <strong>Temporary Password:</strong> <code style="background: #1f2937; color: #f97316; padding: 5px 10px; border-radius: 5px; font-size: 16px;">${tempPassword}</code>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <p style="margin: 10px 0 0 0;">This is a temporary password. You will be required to change it immediately after your first login for security reasons.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Login to Your Account</a>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #e8f5e9; border-radius: 5px; border-left: 4px solid #4caf50;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">What you can do now:</h4>
              <ul style="margin: 0; color: #1e4620;">
                <li>Create and manage aptitude tests</li>
                <li>View student performance analytics</li>
                <li>Schedule tests and contests</li>
                <li>Access teacher resources and materials</li>
              </ul>
            </div>
            
            <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            
            <div class="footer">
              <p>This email was sent by interaAI. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} interaAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

const sendTeacherRegistrationConfirmation = async (email, name) => {
  const mailOptions = {
    from: `"interaAI" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Teacher Registration Received - interaAI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
          .info-box { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Registration Received</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering as a teacher on interaAI!</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #2563eb;">What happens next?</h3>
              <ol style="margin-bottom: 0;">
                <li>Our admin team will review your application</li>
                <li>You'll receive another email with your login credentials</li>
                <li>Typical approval time: 24-48 hours</li>
              </ol>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <div class="footer">
              <p>This email was sent by interaAI. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} interaAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending registration confirmation:', error);
    throw error;
  }
};

module.exports = {
  sendTeacherApprovalEmail,
  sendTeacherRegistrationConfirmation
};