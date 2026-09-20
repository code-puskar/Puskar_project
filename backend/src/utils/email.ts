import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a transporter using Gmail SMTP
// Note: Google requires an App Password to be generated for this to work.
export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.log(`[SMTP DISABLED] Reset link for ${to}: ${resetLink}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"RoadmapHub" <${env.SMTP_USER}>`,
    to,
    subject: 'RoadmapHub - Reset Your Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password for your RoadmapHub account. Click the button below to reset it.</p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #64748b;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:</p>
        <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${resetLink}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
