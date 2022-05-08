const express = require('express');
const router = express.Router();
const validator = require('validator');
const user = require('../models/user');
const createToken = require('../config/createToken');
const sendEmail = require('../config/sendEmail');
const gridOfRandomImages = require('../config/gridOfRandomImages')



router.get('/signup', (req, res)=>{

    res.render('register',{gridOfRandomImages:gridOfRandomImages()})
})


// Api for Signup
router.post('/signup', async (req, res) => {


    
    let email = await user.findOne({ email: req.body.email });

    // Check if user already exists
    if (email) {
        return res.status(400).send(' User already exists!');
    } else {
            //  Here we validate the user email 
            if (validator.isEmail(req.body.email)) {
                const userData = new user({
                    name: req.body.name,
                    email:req.body.email,
                    password: req.body.password
                });
                // Store data Into Database
                await userData.save();
                res.send(userData);
            } else {
                res.status(400).send('Invalid Credentials');
            }

    }
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