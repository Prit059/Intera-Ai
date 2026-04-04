const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - interaAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Welcome to interaAI!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <a href="${verificationUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; 
                    margin: 20px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link: ${verificationUrl}</p>
          <p>This link expires in 24 hours.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendResetPasswordEmail = async (email, token) => {
  try {
    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - interaAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <a href="${resetPasswordUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; 
                    margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link: ${resetPasswordUrl}</p>
          <p>This link expires in 1 hour.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending reset password email:', error);
  }
};

// Add this new function for teacher approval
const sendTeacherApprovalEmail = async (email, name) => {
  try {
    const loginUrl = `${process.env.CLIENT_URL}/login`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Teacher Registration Approved - interaAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Welcome to interaAI, ${name}!</h2>
          <p>Your teacher registration has been <strong style="color: #22c55e;">approved</strong> by the admin.</p>
          <p>You can now:</p>
          <ul>
            <li>Login to your teacher account</li>
            <li>Create and manage aptitude tests</li>
            <li>Track student performance</li>
            <li>Generate test codes for students</li>
          </ul>
          <p><strong>Note:</strong> You will be required to change your password on first login for security purposes.</p>
          <a href="${loginUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; 
                    margin: 20px 0;">
            Login Now
          </a>
          <p>Or copy and paste this link: ${loginUrl}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">If you have any questions, please contact support.</p>
          <p>Best regards,<br>interaAI Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending teacher approval email:', error);
    throw error;
  }
};

// Add this new function for teacher rejection
const sendTeacherRejectionEmail = async (email, name, reason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Teacher Registration Update - interaAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Hello ${name},</h2>
          <p>We regret to inform you that your teacher registration application has been <strong style="color: #ef4444;">rejected</strong>.</p>
          <p><strong>Reason for rejection:</strong> ${reason || 'No specific reason provided'}</p>
          <p>If you believe this is a mistake or would like to reapply with corrected information, please contact our support team.</p>
          <p>You can also try registering again with the correct information.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">If you have any questions, please contact support.</p>
          <p>Best regards,<br>interaAI Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending teacher rejection email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendTeacherApprovalEmail,
  sendTeacherRejectionEmail,
};