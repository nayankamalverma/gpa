require('dotenv').config();
const express = require('express');
const router = express.Router();
const validator = require('validator');
const user = require('../models/user');
const otp = require('../models/otp');
const createToken = require('../config/createToken');
const sendEmail = require('../config/sendEmail');
const gridOfRandomImages = require('../config/gridOfRandomImages');
const verifyPasswordToken = require('../middleware/verifyPasswordToken');
const verifyToken = require('../config/verifyToken');
const bcrypt = require('bcryptjs');
const generateOTP = require('../config/generateOTP');
const sendSMS = require('../config/sendSMS');

router.get('/',(req,res)=>{

    const userCookie = req.cookies['token'];
    if(!userCookie){
        return res.redirect('login')
    }
    const decoded = verifyToken(userCookie, process.env.USER_COOKIE_SECRET)
    if(!decoded){
        return res.redirect('login');
    }
    res.render('success')
})

router.get('/logout',(req,res)=>{
    res.clearCookie("token");
    res.redirect('login')
})

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
        bucketC,
        error: ""

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
    const isValid = verifyToken(token, process.env.RESET_SECRET_KEY)

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

    const {name, email, number, password} = req.body;
    // return res.send(password)
    
    let foundEmail = await user.findOne({ email: email });
    let foundNumber = await user.findOne({ number: number });

    // Check if user already exists
    if (foundEmail || foundNumber) {
        req.flash("error", "User already exist");
        req.flash("name", name);
        req.flash("email", email);
        req.flash("number", number);
        return res.redirect('/signup')
    } 

    //  Here we validate the user mobile number 
    if (!validator.isMobilePhone(number)) {
        req.flash("error", "Enter valid mobile number");
        req.flash("name", name);
        req.flash("email", email);
        req.flash("number", number);
        return res.redirect('/signup')
    }
    //  Here we validate the user email 
    if (!validator.isEmail(email) || !name) {
        req.flash("error", "Invalid Credentials");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect('/signup')
    }
    // Validating length of the password
    if(!(password.length >= 4)){
        req.flash("error", "Select atleast 4 images");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect('/signup')
    }
    let generatedOtp = generateOTP();
    let mobNumber = "+91" + number;
    sendSMS(generatedOtp, mobNumber);

    const userOtp = new otp({
        number,
        otp: generatedOtp
    });
    // store otp into databse
    userOtp.save()
    
    const userData = new user({
        name,
        email,
        number,
        password: password.toString()
    });
    // Store data Into Database
    await userData.save();

    res.render("otp", {
        expressFlash: req.flash('number', number) 
    })

    
})

// Api for Login
router.post('/login', verifyPasswordToken, async (req, res) => {


    //  Get value from user 
        const {email, password} = req.body;

        if(!email){
            req.flash("error", "Invalid Credentials")
            req.flash("email", email);
            return res.redirect('/login')
        }
        
        const foundUser = await user.findOne({ email: email });

        if(!foundUser){
            req.flash("error", "You've not been registered yet")
            req.flash("email", email);
            return res.redirect('/login')
        }

        const isMatch = await bcrypt.compare(password.toString(), foundUser.password)
        if(!isMatch){
            req.flash("error", "Incorrect password!")
            req.flash("email", email);
            return res.redirect('/login')
        }

        let number = foundUser.number
        let generatedOtp = generateOTP();
        let mobNumber = "+91" + number;
        sendSMS(generatedOtp, mobNumber);
    
        const userOtp = new otp({
            number,
            otp: generatedOtp
        });
        // store otp into databse
        userOtp.save()

        res.render("otp", {
            expressFlash: req.flash('number', number) 
        })

        // const usersCookie = req.cookies['token'];
        // console.log(usersCookie);
        // if(usersCookie){
        //     return res.redirect('/')
        // }
        // let userCookie = {
        //     _id: foundUser._id,
        //     email: foundUser.email
        // }
        // let userToken = createToken(userCookie, process.env.USER_COOKIE_SECRET, '24h')
        // console.log(userCookie);
        // res.cookie('token', userToken, {maxAge: 360000});
        // return res.redirect("/")
    })

// Api for Mailing Reset link
router.post('/sendresetlink', async (req, res) => {

    const email = req.body.email;

    const foundUser = await user.findOne({email: email});

    if(!foundUser){
        req.flash("error", "Does not exist user with this email!")
        return res.redirect('/resetpassword')
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
    req.flash("success", "Reset link has been sent to user!")
    req.flash("email", email)
    return res.redirect('/resetpassword')


})

// Api for Reseting Password
router.post('/resetpassword/:token', verifyPasswordToken, async (req, res) => {

    const token = req.params['token'];
    const password = req.body.password;
    // Check if email with that token exist
    const decoded = verifyToken(token, process.env.RESET_SECRET_KEY);

    if(!decoded){
        return res.send("Invalid token");
    }

    const foundUser = await user.findById(decoded.id);
    foundUser.password = password.toString();
    foundUser.save();

    req.flash("success", "Your password has been changed")
    return res.redirect('/login')

})

router.post('/verifyotp', async (req, res) => {
    let { number, enteredOtp } = req.body;

    const foundNumber = await otp.findOne({number: number});
    if(!foundNumber){
        return res.send("Mobile number not found")
    }
    if(!(foundNumber.otp == enteredOtp)){
        return res.render("otp", {
            expressFlash: req.flash('number', number), 
            expressFlash: req.flash('error', "incorrect otp") 
        })

    }
    
    foundUser = await user.findOneAndUpdate({number},{isVerified: true})
    let userCookie = {
        _id: foundUser._id,
        email: foundUser.email
    }
    let userToken = createToken(userCookie, process.env.USER_COOKIE_SECRET, '24h')
    res.cookie('token', userToken, {maxAge: 360000});
    res.redirect('/')


})


module.exports = router;