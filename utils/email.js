const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '234cb8691cbb25',
      pass: 'e2ccc163f146fc',
    },
  });

  // 2) Define the email options

  const mailOptions = {
    from: 'Ihnat Tryhub <hello@ihnat.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
