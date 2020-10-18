const { getCredentialsTokenFromStorage, refreshAccessToken } = require('./helpers/authTokenHelpers');
const { retrieveAccounts, retrieveAllAccountsInfo, simplifyAccountDetails } = require('./helpers/accountHelpers');
const { GENERIC_ERROR_MESSAGE } = require('./utils/constants');
const { isAuthTokenExpired } = require('./utils/isTokenExpired');

module.exports.handler = async event => {
  try {
    const hash = event.queryStringParameters && event.queryStringParameters.hash;
    const simpleResponse = (event.queryStringParameters && event.queryStringParameters.simpleResponse) === 'true';

    if (!hash || hash === '') throw new Error(GENERIC_ERROR_MESSAGE());

    let authInfo = await getCredentialsTokenFromStorage(hash);
    
    if (isAuthTokenExpired(authInfo)) {
      authInfo = await refreshAccessToken(authInfo.refresh_token, hash);
    }

    const { accounts } = await retrieveAccounts(authInfo);
    
    const allDetails = await retrieveAllAccountsInfo(accounts, authInfo);

    if (simpleResponse) {
      return {
        statusCode: 200,
        body: JSON.stringify(simplifyAccountDetails(allDetails), null, 2),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(allDetails, null, 2),
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: error.message }, null, 2),
    };
  }
};
