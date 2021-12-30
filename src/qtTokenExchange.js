const { exchangeAuthCodeForAccessToken } = require('./helpers/authTokenHelpers');
const { hashUserEmail } = require('./utils/encryptionHelpers');
const { GENERIC_ERROR_MESSAGE, LOCALHOST_OVERRIDE_PATH } = require('./utils/constants');

module.exports.handler = async event => {
  let reqMethod = event.method || event.httpMethod;
  if (reqMethod === 'GET') {
    try {
      const authorizationCode = event.queryStringParameters && event.queryStringParameters.code;
      const email = event.queryStringParameters && event.queryStringParameters.email;

      if (!email || email === '' || !authorizationCode || authorizationCode === '') {
        throw new Error(GENERIC_ERROR_MESSAGE());
      }

      const hash = hashUserEmail(email);

      await exchangeAuthCodeForAccessToken(authorizationCode, hash);

      return { statusCode: 200, body: hash };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: true, message: error.message }, null, 2),
      };
    }
  }

  if (reqMethod === 'POST') {
    try {
      const { username, authCode, cbAuthCode } = JSON.parse(event.body);
      let { origin } = event.headers;

      if (origin.includes('localhost')) origin = LOCALHOST_OVERRIDE_PATH();

      if (authCode) {
        await exchangeAuthCodeForAccessToken(authCode, username, origin, 'qt');
      } else if (cbAuthCode) {
        await exchangeAuthCodeForAccessToken(cbAuthCode, username, origin, 'cb');
      }

      let exchange = cbAuthCode ? 'cb' : 'qt';

      return { statusCode: 200, body: username, exchange };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: true, message: error.message }, null, 2),
      };
    }
  }
};
