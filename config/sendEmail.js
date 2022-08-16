const nodemailer = require('nodemailer');

function sendEmail(email, token){

    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });
    
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset Graphical Password',
      text: 'http://localhost:3000/resetpassword/'+ token
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        return false
      } else {
        console.log('Email sent: ' + info.response);
        return true
      }
    });
    console.log(process.env.EMAIL, process.env.PASSWORD);
}

module.exports = sendEmail