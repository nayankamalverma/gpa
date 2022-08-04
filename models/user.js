const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        required: true
    }
})

userSchema.pre('save', async function(next){
    const user = this;
    if (this.isModified("password") || this.isNew) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
})

module.exports = mongoose.model('user', userSchema);