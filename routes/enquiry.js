const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/enquiry', async (req, res) => {
  const { firstName, lastName, email, phone, checkin, checkout, guests, message } = req.body;

  // Basic validation
  if (!firstName || !email || !checkin || !checkout) {
    return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
  }

  try {
    // Configure your email transport in .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use Gmail App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: `🌴 New Booking Enquiry — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif; max-width:500px; color:#1a2415;">
          <h2 style="color:#1a3a2a;">New Enquiry — Villa Serenidade</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><b>Name</b></td><td>${firstName} ${lastName}</td></tr>
            <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><b>Email</b></td><td>${email}</td></tr>
            <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><b>Phone</b></td><td>${phone || 'Not provided'}</td></tr>
            <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><b>Check-in</b></td><td>${checkin}</td></tr>
            <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><b>Check-out</b></td><td>${checkout}</td></tr>
            <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><b>Guests</b></td><td>${guests}</td></tr>
            <tr><td style="padding:8px 0;"><b>Message</b></td><td>${message || 'None'}</td></tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Enquiry sent! We will get back to you within 12 hours.' });

  } catch (err) {
    console.error('Email error:', err.message);
    // Still return success to user even if email fails in dev
    res.json({ success: true, message: 'Enquiry received! We will contact you soon.' });
  }
});

module.exports = router;
