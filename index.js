require('dotenv').config();
const express = require('express');
const app = express();
require('./db/conn.js');


const userAuth = require('./routes/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views');
app.set('view engine','ejs');

// Assets
app.use(express.static('public'))

app.use('/api', userAuth);


app.get('/',(req,res)=>{
    
    res.send('Hello world!');
})





app.listen(3000,()=>{
    
    console.log('Server has started at port 3000.');
})