const nodemailer = require("nodemailer");

/**
 * Create Gmail / SMTP transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true only for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email (Gmail in prod, Ethereal in dev fallback)
 */
const sendEmail = async (options) => {
  try {
    const hasEmailCreds =
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS;

    let transporter;
    let fromAddress;

    // ✅ Use Ethereal if env creds are missing (development fallback)
    if (!hasEmailCreds) {
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      fromAddress = `"Swiss Mail" <${testAccount.user}>`;
    } else {
      transporter = createTransporter();
      fromAddress = `"Swiss Mail" <${process.env.EMAIL_USER}>`;
    }

    const mailOptions = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log preview URL only for Ethereal
    if (!hasEmailCreds) {
      console.log("📧 Ethereal Email Preview:");
      console.log(nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Our Platform!",
    html: `
      <h1>Welcome ${user.name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Email: <strong>${user.email}</strong></p>
      <br />
      <p>Best regards,<br>The Team</p>
    `,
  });
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetEmail = async (user, otp) => {
  return sendEmail({
    to: user.email,
    subject: "Your Password Reset OTP",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>Your One-Time Password (OTP) is:</p>

      <div style="
        font-size: 24px;
        font-weight: bold;
        background: #f3f4f6;
        padding: 12px 20px;
        border-radius: 6px;
        letter-spacing: 3px;
        display: inline-block;
        margin: 10px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <br />
      <p>Regards,<br><strong>VYBE Team</strong></p>
    `,
  });
};

/**
 * Send email verification email
 */
const sendEmailVerification = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: "Verify Your Email Address",
    html: `
      <h1>Email Verification</h1>
      <p>Hi ${user.name},</p>
      <p>Please verify your email by clicking the button below:</p>

      <a href="${verifyUrl}" style="
        background: #28a745;
        color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
        text-decoration: none;
        display: inline-block;
        margin-top: 10px;
      ">
        Verify Email
      </a>

      <p>This link expires in 24 hours.</p>
      <br />
      <p>Best regards,<br>The Team</p>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
};
