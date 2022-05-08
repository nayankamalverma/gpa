require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/userLogin')
    .then(() => console.log('connected to mongodb!'))
    .catch(err => console.error('Something went wrong', err));