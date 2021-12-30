const { getCredentialsTokenFromStorage, refreshAccessToken } = require('./helpers/authTokenHelpers');
const {
  retrieveAccounts,
  retrieveAllAccountsInfo,
  simplifyAccountDetails,
  retrieveCBAccountInfo,
  simplifyCBWalletDetails,
} = require('./helpers/accountHelpers');
const { GENERIC_ERROR_MESSAGE } = require('./utils/constants');
const { isAuthTokenExpired } = require('./utils/isTokenExpired');
const { getCBRates } = require('./helpers/coinbaseRates');

module.exports.handler = async event => {
  let reqMethod = event.method || event.httpMethod;
  if (reqMethod === 'GET') {
    try {
      const hash = event.queryStringParameters && event.queryStringParameters.hash;
      const simpleResponse = (event.queryStringParameters && event.queryStringParameters.simpleResponse) === 'true';
      const exchange = (event.queryStringParameters && event.queryStringParameters.exchange) || 'qt';
      const infoType = event.queryStringParameters && event.queryStringParameters.infoType;

      if (!hash || hash === '') throw new Error(GENERIC_ERROR_MESSAGE());

      let authInfo = await getCredentialsTokenFromStorage(hash, exchange);
      
      if (isAuthTokenExpired(authInfo)) {
        authInfo = await refreshAccessToken(authInfo.refresh_token, hash, exchange);
      }

      const accountData = await retrieveAccounts(authInfo, exchange);

      let allDetails;
      let payload;
      
      if (exchange === 'qt') {
        const { accounts } = accountData;
        allDetails = await retrieveAllAccountsInfo(accounts, authInfo, 'balances');

        payload = simpleResponse ? simplifyAccountDetails(allDetails) : allDetails;
      } else if (exchange === 'cb') {
        const rates = await getCBRates();
        allDetails = await retrieveCBAccountInfo(authInfo);

        payload = simpleResponse ? simplifyCBWalletDetails(allDetails, rates) : allDetails;
      }

      return {
        statusCode: 200,
        body: JSON.stringify(payload, null, 2),
      };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: true, message: error.message }, null, 2),
      };
    }
  }

  if (reqMethod === 'POST') {
    const exchange = (event.queryStringParameters && event.queryStringParameters.exchange) || 'qt';

    try {
      if (exchange === 'cb') {
        throw new Error("Coinbase POST req not supported yet");
      }

      const { username, simpleResponse, infoType } = JSON.parse(event.body);
      let authInfo = await getCredentialsTokenFromStorage(username);
      
      if (isAuthTokenExpired(authInfo)) {
        authInfo = await refreshAccessToken(authInfo.refresh_token, username);
      }

      const { accounts } = await retrieveAccounts(authInfo);
      const allDetails = await retrieveAllAccountsInfo(accounts, authInfo, infoType);

      if (simpleResponse) {
        return { statusCode: 200, body: JSON.stringify(simplifyAccountDetails(allDetails), null, 2) };
      }

      return { statusCode: 200, body: JSON.stringify(allDetails, null, 2) };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: true, message: error.message }, null, 2),
      };
    }
  }
};
