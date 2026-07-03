import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// Load .env variables into process.env
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'otp-sender-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Normalize URL path
          const urlPath = req.url.split('?')[0];

          if (urlPath === '/api/send-otp' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { email, code, type } = JSON.parse(body);
                
                // Read loaded environment variables
                const host = process.env.AETHER_SMTP_HOST;
                const port = process.env.AETHER_SMTP_PORT || 587;
                const user = process.env.AETHER_SMTP_USER;
                const pass = process.env.AETHER_SMTP_PASS;
                const from = process.env.AETHER_SMTP_FROM || user;

                if (!host || !user || !pass) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    success: false, 
                    error: 'SMTP credentials not configured in .env file.' 
                  }));
                  return;
                }

                const transporter = nodemailer.createTransport({
                  host,
                  port: parseInt(port),
                  secure: port == 465, // True for 465, false for 587
                  auth: { user, pass }
                });

                const subject = type === 'reset' ? 'Aether AI OS - Security Recovery Code' : 'Aether AI OS - Biometric OTP Verification';
                const html = `
                  <div style="font-family: 'Outfit', sans-serif; background-color: #02020a; color: #f8fafc; padding: 40px; border-radius: 14px; max-width: 480px; margin: 0 auto; border: 1px solid rgba(16, 185, 129, 0.25); box-shadow: 0 8px 30px rgba(0,0,0,0.8);">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="font-size: 32px; font-weight: 800; color: #10b981; letter-spacing: 0.05em; display: inline-block;">Æ AETHER AI OS</div>
                      <div style="font-size: 10px; color: #00d2ff; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">SECURE NEURAL GATEWAY</div>
                    </div>
                    <div style="background: rgba(4, 12, 32, 0.6); padding: 24px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.15);">
                      <h3 style="color: #ffffff; margin-top: 0; font-size: 18px; font-weight: 600; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">SECURITY CODE VERIFICATION</h3>
                      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 16px;">
                        A session authentication sweep requested authorization. Enter this security telemetry code into the node gateway:
                      </p>
                      <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; font-size: 36px; font-family: monospace; font-weight: 700; letter-spacing: 0.2em; color: #ffffff; text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);">
                        ${code}
                      </div>
                      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
                        This is an automated transmission. If you did not initiate this authorization, please ignore this email.
                      </p>
                    </div>
                  </div>
                `;

                await transporter.sendMail({ from, to: email, subject, html });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else if (urlPath === '/api/chat' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { messages } = JSON.parse(body);
                const apiKey = process.env.GROQ_API_KEY;

                if (!apiKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'GROQ_API_KEY not configured in .env file.' }));
                  return;
                }

                if (!messages || !Array.isArray(messages) || messages.length === 0) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Invalid messages payload.' }));
                  return;
                }

                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages,
                    stream: false,
                    max_tokens: 1024,
                    temperature: 0.75
                  })
                });

                const responseText = await groqRes.text();

                if (!groqRes.ok) {
                  res.writeHead(groqRes.status, { 'Content-Type': 'application/json' });
                  res.end(responseText);
                  return;
                }

                const data = JSON.parse(responseText);
                const content = data.choices?.[0]?.message?.content;

                if (!content) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Empty response from Groq.' }));
                  return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ content }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
})
