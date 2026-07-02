// api/send-otp.js — Vercel Serverless Function
// Sends OTP verification emails via Nodemailer/SMTP.
// Set these environment variables in your Vercel project settings:
//   AETHER_SMTP_HOST, AETHER_SMTP_PORT, AETHER_SMTP_USER, AETHER_SMTP_PASS, AETHER_SMTP_FROM

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, code, type } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and code are required.' });
    }

    // Read SMTP credentials from environment variables (set these in Vercel)
    const host = process.env.AETHER_SMTP_HOST;
    const port = parseInt(process.env.AETHER_SMTP_PORT || '587');
    const user = process.env.AETHER_SMTP_USER;
    const pass = process.env.AETHER_SMTP_PASS;
    const from = process.env.AETHER_SMTP_FROM || user;

    if (!host || !user || !pass) {
      return res.status(500).json({
        success: false,
        error: 'SMTP credentials not configured. Add AETHER_SMTP_HOST, AETHER_SMTP_USER, AETHER_SMTP_PASS to Vercel environment variables.'
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass }
    });

    const isReset = type === 'reset';
    const subject = isReset
      ? 'Aether AI OS — Security Recovery Code'
      : 'Aether AI OS — Biometric OTP Verification';

    const html = `
      <div style="font-family: 'Outfit', Arial, sans-serif; background-color: #02020a; color: #f8fafc; padding: 40px; border-radius: 14px; max-width: 480px; margin: 0 auto; border: 1px solid rgba(16, 185, 129, 0.25); box-shadow: 0 8px 30px rgba(0,0,0,0.8);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 28px; font-weight: 800; color: #10b981; letter-spacing: 0.05em;">Æ AETHER AI OS</div>
          <div style="font-size: 10px; color: #00d2ff; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">SECURE NEURAL GATEWAY</div>
        </div>
        <div style="background: rgba(4, 12, 32, 0.6); padding: 24px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.15);">
          <h3 style="color: #ffffff; margin-top: 0; font-size: 18px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
            ${isReset ? 'PASSWORD RECOVERY CODE' : 'SECURITY CODE VERIFICATION'}
          </h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 16px;">
            ${isReset
              ? 'A password recovery request was initiated for your account. Use this code to reset your password:'
              : 'A session authentication sweep requested authorization. Enter this security telemetry code into the node gateway:'
            }
          </p>
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; font-size: 40px; font-family: monospace; font-weight: 700; letter-spacing: 0.25em; color: #ffffff; text-shadow: 0 0 12px rgba(16, 185, 129, 0.6);">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0; text-align: center;">
            This code expires in 10 minutes. If you did not initiate this request, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #334155; letter-spacing: 0.1em; text-transform: uppercase;">
          Aether AI OS · Secure Automated Transmission · Do Not Reply
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Aether AI OS" <${from}>`,
      to: email,
      subject,
      html
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[Aether OTP] Email send error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to send OTP email.'
    });
  }
}
