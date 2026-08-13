// import nodemailer from "nodemailer";

// class EmailService {
//   constructor() {
//     this.transporter = null;
//   }

//   getTransporter() {
//     const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
//     const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10);
//     const user = process.env.EMAIL_USER || process.env.SMTP_USER;
//     const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;

//     if (!user || !pass || !user.trim() || !pass.trim()) {
//       return null;
//     }

//     return nodemailer.createTransport({
//       host,
//       port,
//       secure: port === 465,
//       auth: {
//         user,
//         pass,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });
//   }

//   /**
//    * Send OTP Email for Password Reset
//    * @param {string} toEmail - Recipient email address
//    * @param {string} otp - 6-digit numeric OTP code
//    */
//   async sendOTPEmail(toEmail, otp) {
//     const transporter = this.getTransporter();

//     if (!transporter) {
//       console.warn(`⚠️ Cannot send OTP email to ${toEmail}: SMTP credentials (EMAIL_USER / EMAIL_PASSWORD) are not configured in .env.`);
//       return { messageId: "mock-otp-console", mock: true };
//     }

//     const fromUser = process.env.EMAIL_USER || process.env.SMTP_USER || "noreply@modelforge.ai";

//     const htmlContent = `
//       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background-color: #0f172a; border-radius: 16px; color: #f8fafc; border: 1px solid #1e293b;">
//         <div style="text-align: center; margin-bottom: 24px;">
//           <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">ModelForge AI</h1>
//           <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">No-Code Machine Learning Platform</p>
//         </div>

//         <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
//           <h2 style="color: #f1f5f9; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
//           <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
//             We received a request to reset the password for your ModelForge AI account. Use the following One-Time Password (OTP) to proceed:
//           </p>

//           <div style="text-align: center; margin: 28px 0;">
//             <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #090d16; padding: 12px 28px; border-radius: 8px; border: 1px dashed #38bdf8;">
//               ${otp}
//             </span>
//           </div>

//           <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
//             ⏳ This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support.
//           </p>

//         </div>

//         <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
//           &copy; ${new Date().getFullYear()} ModelForge AI. All rights reserved.
//         </div>

//       </div>
//     `;

//     const mailOptions = {
//       from: `"ModelForge AI Security" <${fromUser}>`,
//       to: toEmail,
//       subject: `ModelForge AI - Your Password Reset OTP: ${otp}`,
//       html: htmlContent,
//     };

//     try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log(`✅ Password Reset OTP sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
//       return info;
//     } catch (err) {
//       console.error(`❌ Failed to send OTP email to ${toEmail}:`, err);
//       throw new Error(`Email sending failed: ${err.message}`);
//     }
//   }
// }

// export default new EmailService();

import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    const host =
      process.env.EMAIL_HOST ||
      process.env.SMTP_HOST ||
      "smtp.gmail.com";

    const port = parseInt(
      process.env.EMAIL_PORT ||
      process.env.SMTP_PORT ||
      "587",
      10
    );

    const user =
      process.env.EMAIL_USER ||
      process.env.SMTP_USER;

    const pass =
      process.env.EMAIL_PASSWORD ||
      process.env.SMTP_PASS;

    if (!user || !pass || !user.trim() || !pass.trim()) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,

      // Gmail port 587 uses STARTTLS
      secure: port === 465,

      // Force IPv4 to avoid IPv6 ENETUNREACH errors on Render
      family: 4,

      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * Send OTP Email for Password Reset
   * @param {string} toEmail - Recipient email address
   * @param {string} otp - 6-digit numeric OTP code
   */
  async sendOTPEmail(toEmail, otp) {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn(
        `⚠️ Cannot send OTP email to ${toEmail}: SMTP credentials (EMAIL_USER / EMAIL_PASSWORD) are not configured.`
      );

      return {
        messageId: "mock-otp-console",
        mock: true,
      };
    }

    const fromUser =
      process.env.EMAIL_USER ||
      process.env.SMTP_USER ||
      "noreply@modelforge.ai";

    const htmlContent = `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 560px;
        margin: 0 auto;
        padding: 32px;
        background-color: #0f172a;
        border-radius: 16px;
        color: #f8fafc;
        border: 1px solid #1e293b;
      ">

        <div style="
          text-align: center;
          margin-bottom: 24px;
        ">
          <h1 style="
            color: #6366f1;
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.02em;
          ">
            ModelForge AI
          </h1>

          <p style="
            color: #94a3b8;
            font-size: 14px;
            margin-top: 4px;
          ">
            No-Code Machine Learning Platform
          </p>
        </div>

        <div style="
          background-color: #1e293b;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #334155;
        ">

          <h2 style="
            color: #f1f5f9;
            font-size: 18px;
            margin-top: 0;
          ">
            Password Reset Request
          </h2>

          <p style="
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.6;
          ">
            We received a request to reset the password for your
            ModelForge AI account. Use the following One-Time Password
            (OTP) to proceed:
          </p>

          <div style="
            text-align: center;
            margin: 28px 0;
          ">
            <span style="
              display: inline-block;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: 8px;
              color: #38bdf8;
              background: #090d16;
              padding: 12px 28px;
              border-radius: 8px;
              border: 1px dashed #38bdf8;
            ">
              ${otp}
            </span>
          </div>

          <p style="
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 0;
          ">
            ⏳ This OTP is valid for <strong>10 minutes</strong>.
            If you did not request a password reset, please ignore
            this email or contact support.
          </p>

        </div>

        <div style="
          text-align: center;
          margin-top: 24px;
          color: #64748b;
          font-size: 12px;
        ">
          &copy; ${new Date().getFullYear()} ModelForge AI.
          All rights reserved.
        </div>

      </div>
    `;

    const mailOptions = {
      from: `"ModelForge AI Security" <${fromUser}>`,
      to: toEmail,
      subject: `ModelForge AI - Your Password Reset OTP: ${otp}`,
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);

      console.log(
        `✅ Password Reset OTP sent successfully to ${toEmail}. Message ID: ${info.messageId}`
      );

      return info;
    } catch (err) {
      console.error(
        `❌ Failed to send OTP email to ${toEmail}:`,
        err
      );

      throw new Error(
        `Email sending failed: ${err.message}`
      );
    }
  }
}

export default new EmailService();