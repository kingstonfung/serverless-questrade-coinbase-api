const { exchangeAuthCodeForAccessToken } = require('./helpers/authTokenHelpers');
const { hashUserEmail } = require('./utils/encryptionHelpers');
const { GENERIC_ERROR_MESSAGE } = require('./utils/constants');

module.exports.handler = async event => {
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
};
