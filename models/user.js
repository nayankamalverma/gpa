const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    name:{
        type: String,
        required: true,
        minlength:3,
        maxlength:30
       
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true

    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 32
    }
})

module.exports = mongoose.model('user', userSchema);