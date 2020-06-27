const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Admin of NatoursApp <${process.env.EMAIL_FROM}>`;
   }

   // 1) Create a transporter
   newTransport() {
      if (process.env.NODE_ENV === 'production') {
         // Sendgrid
         return 1;
      }

      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
         }
      });
   }

   async send(template, subject) {
      // 1) Render html based on pug template
      const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
         firstName: this.firstName,
         url: this.url,
         subject
      });

      // 2) Define email options
      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: htmlToText.fromString(html)
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
   }

   async sendWelcome() {
      await this.send('welcome', 'Welcome to the NatoursApp Family!');
   }

   async sendPasswordReset() {
      await this.send('passwordReset', 'Your Password reset token (valid for 10 minutes)');
   }

   async sendValidateSignup() {
      await this.send('validateSignup', 'Please validate your Natours Account!');
   }

   async sendValidateLogin() {
      await this.send('validateLogin', 'Please verify your Natours Account first!');
   }
};