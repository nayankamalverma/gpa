const jwt = require('jsonwebtoken');

function verifyToken(token, secretKey){
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded
      } catch (err) {
        return false;
      }
}

module.exports = verifyToken