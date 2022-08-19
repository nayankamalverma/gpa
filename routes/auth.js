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

router.get('/',(req,res)=>{
    const userCookie = req.cookies['token'];
    if(!userCookie){
        return res.redirect('login')
    }
    const decoded = verifyPasswordToken(userCookie, process.env.USER_COOKIE_SECRET)
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

    const {name, email, password} = req.body;
    // return res.send(password)
    
    let foundEmail = await user.findOne({ email: email });

    // Check if user already exists
    if (foundEmail) {
        req.flash("error", "User already exist");
        req.flash("name", name);
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
    // return res.send(req.body)
        const userData = new user({
            name,
            email,
            password: password.toString()
        });
        // Store data Into Database
        await userData.save();
        res.redirect("/")

    
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
        let userCookie = {
            _id: foundUser._id,
            email: foundUser.email
        }
        let userToken = createToken(userCookie, process.env.USER_COOKIE_SECRET, '24h')
        console.log(userCookie);
        res.cookie('token', userToken, {maxAge: 360000});
        return res.redirect("/")
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
    console.log(password);
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

module.exports = router;