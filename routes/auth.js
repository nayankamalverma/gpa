require('dotenv').config();
const express = require('express');
const router = express.Router();
const validator = require('validator');
const user = require('../models/user');
const createToken = require('../config/createToken');
const sendEmail = require('../config/sendEmail');
const gridOfRandomImages = require('../config/gridOfRandomImages');
const verifyPasswordToken = require('../middleware/verifyPasswordToken');
const verifyToken = require('../config/verifyToken');
const bcrypt = require('bcryptjs');
router.get('/signup', async (req, res)=>{
    const noBucket = createToken({key: process.env.NO_BUCKET}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketA = createToken({key: process.env.BUCKET_A}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketB = createToken({key: process.env.BUCKET_B}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketC = createToken({key: process.env.BUCKET_C}, process.env.BUCKET_SECRET_KEY, '300s')
    res.render('register',{
        gridOfRandomImages:gridOfRandomImages(),
        noBucket,
        bucketA,
        bucketB,
        bucketC

    })
})

router.get('/login', (req, res)=>{
    const noBucket = createToken({key: process.env.NO_BUCKET}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketA = createToken({key: process.env.BUCKET_A}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketB = createToken({key: process.env.BUCKET_B}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketC = createToken({key: process.env.BUCKET_C}, process.env.BUCKET_SECRET_KEY, '300s')
    res.render('login',{
        gridOfRandomImages:gridOfRandomImages(),
        noBucket,
        bucketA,
        bucketB,
        bucketC

    })
})

router.get('/resetpassword', (req, res)=>{
    res.render('resetPassword')
})

router.get('/resetpassword/:token', async (req, res) => {
    const token = req.params['token'];
    console.log(token);
    const isValid = verifyToken(token, process.env.RESET_SECRET_KEY)
    console.log("isValid: ", isValid)

    if(!isValid){
        return res.send("Invalid token!")
    }
    const noBucket = createToken({key: process.env.NO_BUCKET}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketA = createToken({key: process.env.BUCKET_A}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketB = createToken({key: process.env.BUCKET_B}, process.env.BUCKET_SECRET_KEY, '300s')
    const bucketC = createToken({key: process.env.BUCKET_C}, process.env.BUCKET_SECRET_KEY, '300s')
    res.render('newPassword',{
        gridOfRandomImages:gridOfRandomImages(),
        noBucket,
        bucketA,
        bucketB,
        bucketC

    })
})


// Api for Signup
router.post('/signup', verifyPasswordToken, async (req, res) => {

    const {name, email, password} = req.body;
    // return res.send(password)
    
    let foundEmail = await user.findOne({ email: email });

    // Check if user already exists
    if (foundEmail) {
        return res.status(400).send(' User already exists!');
    } 
    //  Here we validate the user email 
    if (!validator.isEmail(email) || !name) {
        return res.status(400).send('Invalid Credentials');
    }
    // Validating length of the password
    if(!(password.length >= 4)){
        return res.status(400).send('Select atleast 4 images');
    }
    // return res.send(req.body)
        const userData = new user({
            name,
            email,
            password: password.toString()
        });
        // Store data Into Database
        await userData.save();
        res.send(userData);
    

    
})

// Api for Login
router.post('/login', verifyPasswordToken, async (req, res) => {


    //  Get value from user 
        const {email, password} = req.body;
        
        const foundUser = await user.findOne({ email: email });

        if(!foundUser){
            return res.send("you've not been registered yet")
        }

        const isMatch = await bcrypt.compare(password.toString(), foundUser.password)
        if(!isMatch){
            return res.send("Incorrect password!")
        }
        return res.send("You are a authorized user")
    })

// Api for Mailing Reset link
router.post('/sendresetlink', async (req, res) => {

    const foundUser = await user.findOne({email: req.body.email});
    console.log(foundUser);

    if(!foundUser){
        return res.send('Does not exist user with this email.');
    }

    const payload = {
        email : foundUser.email,
        id: foundUser._id
    }
    const token = createToken(payload, process.env.RESET_SECRET_KEY, '600s');
    const emailResponse = await sendEmail(foundUser.email, token);
    console.log(emailResponse);
    
    // if(!emailResponse){
    //     return res.send("unable to send email, please try again after sometime!")
    // }
    res.send("Reset link has been sent to user!")


})

// Api for Reseting Password
router.post('/resetpassword/:token', verifyPasswordToken, async (req, res) => {

    const token = req.params['token'];
    const password = req.body.password;
    console.log(password);
    // Check if email with that token exist
    const decoded = verifyToken(token, process.env.RESET_SECRET_KEY);

    if(!decoded){
        return res.send("Invalid token");
    }

    const foundUser = await user.findById(decoded.id);
    foundUser.password = password.toString();
    foundUser.save();

    res.send("Your password has been changed");

})

module.exports = router;