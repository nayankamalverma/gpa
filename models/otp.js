const mongoose = require('mongoose');
const { Schema } = mongoose;

const numberSchema = new Schema({

    number: {
        type: String,
    },
    otp:{
        type: Number
    },
    createdAt: {
        type: Date,
        expires: '5m',
        default: Date.now }

})

module.exports = mongoose.model('otp', numberSchema);