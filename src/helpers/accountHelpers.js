const axios = require('axios');

const retrieveAccounts = async ({ access_token, api_server, token_type }) => {
  try {
    const headers = { 'Authorization': `${token_type} ${access_token}` };
    const { data } = await axios.get(`${api_server}v1/accounts`, { headers });
    return Promise.resolve(data);
  } catch (error) {
    console.error('retrieve accounts error: ', error);
    return Promise.reject(error);
  }
};

const retrieveAllAccountsInfo = async (accounts, { access_token, token_type, api_server }) => {
  const accountsInfo = [];

  try {
    const promises = accounts.map((account, index) => {
      accountsInfo.push({ type: account.type, id: account.number });
      return retrieveSingleAccountInfo(access_token, token_type, api_server, account.number);
    });

    const accountDetails = await Promise.all(promises);

    const detailedAccounts = accounts.map((account, index) => {
      return {
        ...account,
        ...accountDetails[index],
      };
    });

    return Promise.resolve(detailedAccounts);
  } catch (error) {
    console.error('Retrieve account details error', error);
    return Promise.reject(error);
  }
};

const simplifyAccountDetails = (detail) => {
  const simplifiedDetail = detail.map(account => ({
    type: account.type,
    number: account.number,
    balance: account.combinedBalances.find(exchange => exchange.currency === 'CAD').totalEquity,
  }));

  return simplifiedDetail;
};

module.exports = { retrieveAccounts, retrieveAllAccountsInfo, simplifyAccountDetails };

// "private" functions

const retrieveSingleAccountInfo = async (token, tokenType, server, accountId) => {
  try {
    const url = `${server}v1/accounts/${accountId}/balances`;
    const headers = { 'Authorization': `${tokenType} ${token}` };
    const { data } = await axios.get(url, { headers });
    return Promise.resolve(data);
  } catch (error) {
    console.error('Error retrieving single account info', error)
    return Promise.reject(error);
  }
};