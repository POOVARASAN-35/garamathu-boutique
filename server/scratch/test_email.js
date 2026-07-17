import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: './.env' });

const testMail = async () => {
  console.log('Using SMTP Config with tls.rejectUnauthorized=false:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('Secure:', process.env.SMTP_SECURE);
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass:', process.env.SMTP_PASS ? '********' : 'undefined');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('Transporter is ready to send messages!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Gramathu Boutique Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // send to self
      subject: 'Test Email from Gramathu Boutique',
      text: 'If you receive this, SMTP is working perfectly!'
    });
    console.log('Email sent successfully!', info.messageId);
  } catch (error) {
    console.error('Error during email sending:', error);
  }
};

testMail();
