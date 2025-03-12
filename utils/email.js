const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

require('dotenv').config();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ihnat Tryhub ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //
      return 1;
    }
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Rendet HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template.toLowerCase()}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
      // html
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the GoTours Family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your passowrd reset token (valid for only 10 minutes)');
  }
};
