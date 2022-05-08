const jwt = require('jsonwebtoken');

function createToken(payload, secretKey = process.env.SECRET_KEY){

    const token = jwt.sign(payload,secretKey);
    return token
}

module.exports = createToken