import Contact from '../models/Contact.js';
import { sendContactFormEmails } from '../utils/emailService.js';

export const submitContactMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  try {
    const newContact = new Contact({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      subject: subject || '',
      message
    });

    await newContact.save();

    // Trigger emails asynchronously
    sendContactFormEmails(newContact).catch(err => {
      console.error('Failed to trigger contact emails:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. Our team will contact you soon.',
      data: newContact
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save contact message', error: error.message });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving messages', error: error.message });
  }
};
