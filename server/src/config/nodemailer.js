const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT || 465);
const secure = port === 465; // true for 465, false for other ports

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;

if (!user || !pass) {
  // Provide a clear error up-front so we don't hit a vague EAUTH later
  throw new Error(
    'SMTP credentials missing. Please set SMTP_USER and SMTP_PASSWORD in backend/.env (for Gmail App Passwords, use the 16-character password without spaces or quotes).'
  );
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

module.exports = transporter;
