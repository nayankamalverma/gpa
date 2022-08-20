const jwt = require('jsonwebtoken');
const verifyToken = require('../config/verifyToken');

const verifyPasswordToken = async (req, res, next) => {
    let {password, formType} = req.body

    if(!password){
        req.flash("error", "Select password");

        if(formType == "signup"){
            return res.redirect('/signup')
        }
        if(formType == "login"){
            return res.redirect('/login')
        }
        if(formType == "newPassword"){
            let token = req.params['token']
            return res.redirect(`/resetpassword/${token}`)
        }
    }

    let passArray = password.split(',');
    for (let i = 0; i < passArray.length; i++) {
        const element = passArray[i];
        let imageToken = element.split(':_:')[0];
        let bucketToken = element.split(':_:')[1];
        let decodedImageToken = verifyToken(imageToken, process.env.IMAGE_SECRET_KEY)
        let decodedBucketToken = verifyToken(bucketToken, process.env.BUCKET_SECRET_KEY)

        if(!decodedImageToken || !decodedBucketToken){
            req.send("Invalid token, either image token or bucket token");
        }
        
        passArray[i] = `${decodedImageToken.key}:_:${decodedBucketToken.key}`

    }
    req.body.password = passArray
    next();
}

module.exports = verifyPasswordToken;