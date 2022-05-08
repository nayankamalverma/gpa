const nodemailer = require('nodemailer');

function sendEmail(email,resetLink){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: '309302219003@bitraipur.ac.in',
          pass: '12345678'
        }
      });
    
    var mailOptions = {
      from: '309302219003@bitraipur.ac.in',
      to: email,
      subject: 'Reset Graphical Password',
      text: 'http://localhost:3000/resetpassword/'+resetLink
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    console.log(process.env.EMAIL, process.env.PASSWORD);
}

module.exports = sendEmail