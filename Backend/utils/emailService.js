const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Crear transportador para el correo
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Definir opciones del correo
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  // Enviar correo
  const info = await transporter.sendMail(mailOptions);
  
  console.log(`Correo enviado: ${info.messageId}`);
};

module.exports = sendEmail;