const CryptoJS = require('crypto-js');
const { MD5_SCRAMBLE_MULTIPLIER } = require('./constants');

const hashUserEmail = email => {
  let h = CryptoJS.MD5(email).toString();

  for (let i = 0; i < MD5_SCRAMBLE_MULTIPLIER(); i++) {
    h = CryptoJS.MD5(h).toString();
  }

  return h;
}

module.exports = { hashUserEmail };
