require('dotenv').config();
const express = require('express');
const router = express.Router();
const validator = require('validator');
const user = require('../models/user');
const createToken = require('../config/createToken');
const sendEmail = require('../config/sendEmail');
const gridOfRandomImages = require('../config/gridOfRandomImages');

router.get('/signup', (req, res)=>{
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


// Api for Signup
router.post('/signup', async (req, res) => {

    const {name, email, password} = req.body;
    console.log(password);
    
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
    if(!(password.split(',').length >= 4)){
        return res.status(400).send('Select atleast 4 images');
    }
    // return res.send(req.body)
        const userData = new user({
            name,
            email,
            password
        });
        // Store data Into Database
        await userData.save();
        res.send(userData);
    

    
})

// Api for Login
router.post('/login', async (req, res) => {


    //  Get value from user 
        const email = req.body.email;
        const password = req.body.password;
    
    
        user.findOne({ email: email }, function (error, foundUser) {
            if (!error) {
                if (foundUser) {
                    // compare password  
                    if (foundUser.password == password) {
                        //password matches
                        res.send("you are an authorized User")
    
                    } else {
                        res.send('Incorrect password!')
    
                    }
                    
                } else {
                    res.send("you've not been registered yet")
                }
            } else {
                res.send(error);
            }
        })
    
    
    
    })

// Api for Mailing Reset link
router.post('/sendresetlink', async (req, res) => {

    user.findOne({email: req.body.email},async function(error, founduser){

        if(!error){
                // Check if user is authorized
            if(founduser){
                
                const payload = {
                    email : founduser.email,
                    id : founduser._id
                }
                const token = await createToken(payload)
                
                sendEmail(founduser.email, token)
                res.send("Reset link has been sent to user!")
            }else{
                res.send('Does not exist user with this email.')
            }
        }else{
            res.send(error)
        }
    })


})

// Api for Reseting Password
router.post('/resetpassword/:token', async (req, res) => {

    // Check if email with that token exist
    console.log(req.params['token']);
    studentotp.findOne({resetLink: req.params['token']},async function(error,founduser){

        if(!error){
            if(founduser){
                // Searching email in student database
                let user = await Student.findOne({email: founduser.email})
                if(user){
                    // Comparing password and confirm password
                    if(req.body.password==req.body.cpassword){

                        user.password = req.body.password
                        user.cpassword = req.body.cpassword
                        // Save data into database
                        user.save()
                        res.send(user)
                    }else{
                        res.send('Password does not match')
                    }
                }
                // res.send('user found')
            }else{
                res.send('Token not found')
            }
        }else{
            res.send(error)
        }
    })

})

module.exports = router;