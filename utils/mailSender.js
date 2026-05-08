const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    console.log("🔄 Sending email to:", email);
    console.log("📧 Subject:", title);

    const mailHost = process.env.MAIL_HOST?.trim();
    const mailUser = process.env.MAIL_USER?.trim();
    const mailPass = process.env.MAIL_PASS?.trim();
    const mailPort = Number(process.env.MAIL_PORT || 587);
    const mailSecure = process.env.MAIL_SECURE === "true";

    if (!mailHost || !mailUser || !mailPass) {
      console.log("❌ Missing email configuration environment variables");
      throw new Error(
        "Email configuration is missing (MAIL_HOST, MAIL_USER, MAIL_PASS)",
      );
    }

    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailSecure,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    console.log("✅ Mail server connection verified");

    const info = await transporter.sendMail({
      from: `"Study Notion" <${mailUser}>`,
      to: email,
      subject: title,
      html: body,
      text: body.replace(/<[^>]+>/g, ""),
    });

    console.log("✅ Email sent successfully. Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.log("❌ Error while Mailing:", error.message);
    throw error;
  }
};

module.exports = mailSender;
