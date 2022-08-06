const jwt = require('jsonwebtoken');

function createToken(payload, secretKey = process.env.RESET_SECRET_KEY, time = '600s'){

    const token = jwt.sign(payload, secretKey, {expiresIn: time});
    return token
}

module.exports = createToken