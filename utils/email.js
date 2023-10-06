const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firtName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ngoc Hung <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: 25,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in gmail "less secure app" option
    });
  }

  async send(template, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: 'gui cai gi day chonon di ',
      // html:  options.html
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.end('welcome', ' Welcome to the Natours Family!');
  }
};

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: 25,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'EZ Channel For KIDS <ngochung@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:  options.html
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
