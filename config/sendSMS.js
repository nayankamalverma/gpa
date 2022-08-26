const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

function sendSMS(body, number) {
          
    client.messages
  .create({
     body: body,
     from: "+18149292762", 
     to: number
   })
  .then(message => console.log(message.sid));
}

module.exports = sendSMS