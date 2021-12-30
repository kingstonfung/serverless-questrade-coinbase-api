const axios = require('axios');
const { CB_API_PATH, CB_API_VERSION } = require('../utils/constants');

const retrieveAccounts = async ({ access_token, api_server, token_type }, exchange = 'qt') => {
  try {
    let data;
    const headers = { 'Authorization': `${token_type} ${access_token}` };

    if (exchange === 'qt') {
      ({ data } = await axios.get(`${api_server}v1/accounts`, { headers }));
    } else if (exchange === 'cb') {
      headers['CB-VERSION'] = CB_API_VERSION();
      ({ data } = await axios.get(`${CB_API_PATH()}/v2/user`, { headers }));
      data = data.data;
    }

    return Promise.resolve(data);
  } catch (error) {
    console.error('retrieve accounts error: ', error);
    return Promise.reject(error);
  }
};

const retrieveCBAccountInfo = async ({ access_token, token_type }) => { // Coinbase
  const headers = { 'Authorization': `${token_type} ${access_token}`, 'CB-VERSION': CB_API_VERSION() };
  const url = `${CB_API_PATH()}/v2/accounts`;
  const { data } = await axios.get(url, { headers });
  const wallets = data.data;
  return Promise.resolve(wallets);
}

const simplifyCBWalletDetails = (wallets, rates) => { // Coinbase
  const simplifiedWallets = wallets.map(wallet => ({
    currency: wallet.balance.currency,
    amount: Number(wallet.balance.amount),
    cadValue: Number(wallet.balance.amount) / rates[wallet.balance.currency],
  }));

  return simplifiedWallets;
}

const retrieveAllAccountsInfo = async (accounts, authInfo, infoType) => { // Questrade
  const { access_token, token_type, api_server } = authInfo;
  const accountsInfo = [];

  try {
    const promises = accounts.map(account => {
      accountsInfo.push({ type: account.type, id: account.number });
      return retrieveSingleAccountInfo(
        access_token,
        token_type,
        api_server,
        account.number,
        infoType,
      );
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

const simplifyAccountDetails = (detail) => { // Questrade
  const simplifiedDetail = detail.map(account => ({
    type: account.type,
    number: account.number,
    balance: account.combinedBalances.find(exchange => exchange.currency === 'CAD').totalEquity,
  }));

  return simplifiedDetail;
};

module.exports = {
  retrieveAccounts,
  retrieveAllAccountsInfo,
  simplifyAccountDetails,
  retrieveCBAccountInfo,
  simplifyCBWalletDetails,
};

// "private" functions

const retrieveSingleAccountInfo = async (token, tokenType, server, accountId, type) => {
  try {
    const url = `${server}v1/accounts/${accountId}/${type}`;
    const headers = { 'Authorization': `${tokenType} ${token}` };
    const { data } = await axios.get(url, { headers });
    return Promise.resolve(data);
  } catch (error) {
    console.error('Error retrieving single account info', error)
    return Promise.reject(error);
  }
};
