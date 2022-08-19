require('dotenv').config();
const express = require('express');
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const cookieParser = require('cookie-parser');
require('./db/conn.js');

//session store
let mongoStore = MongoDbStore.create({
    mongoUrl: "mongodb://localhost/userLogin",
  });
  
  //session config
  app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      store: mongoStore,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
    })
  );
  app.use(cookieParser());
  app.use(flash());


const userAuth = require('./routes/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views');
app.set('view engine','ejs');

// Assets
app.use(express.static('public'))

app.use('/', userAuth);

app.listen(3000,()=>{
    
    console.log('Server has started at port 3000.');
})