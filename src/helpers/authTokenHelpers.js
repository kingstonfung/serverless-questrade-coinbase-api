const axios = require('axios');
const { putObject, getObject } = require('../utils/s3Helpers');
const {
  BUCKET_NAME,
  AUTH_DATA_FILENAME,
  QT_DOMAIN,
  QT_CLIENT_ID,
  REDIRECT_URI,
  CB_AUTH_DATA_FILENAME,
  CB_DOMAIN,
  CB_CLIENT_ID,
  CB_CLIENT_SECRET,
} = require('../utils/constants');

const getCredentialsTokenFromStorage = async (id, exchange = 'qt') => {
  const filename = exchange === 'qt' ? AUTH_DATA_FILENAME() : CB_AUTH_DATA_FILENAME();
  const data = await getObject(BUCKET_NAME(), `${id}/${filename}`);
  const jsonStr = data.Body.toString();
  const authInfo = JSON.parse(jsonStr);
  try {
    return Promise.resolve(authInfo);
  } catch (error) {
    return Promise.reject(error);
  }
};

const refreshAccessToken = async (refreshToken, id, exchange = 'qt') => {
  let url;
  const filename = exchange === 'qt' ? AUTH_DATA_FILENAME() : CB_AUTH_DATA_FILENAME();

  if (exchange === 'qt') {
    url = `${QT_DOMAIN()}?grant_type=refresh_token&refresh_token=${refreshToken}`;
  } else if (exchange === 'cb') {
    const clientId = await CB_CLIENT_ID();
    const clientSecret = await CB_CLIENT_SECRET();
    url = `${CB_DOMAIN()}?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}`;
  }

  try {
    const { data: authExchangeData } = await axios.post(url);
    authExchangeData.timestamp = +new Date();

    await putObject(
      JSON.stringify(authExchangeData, null, 2),
      BUCKET_NAME(),
      `${id}/${filename}`,
    );

    return Promise.resolve(authExchangeData);
  } catch (error) {
    return Promise.reject(error);
  }
};

const exchangeAuthCodeForAccessToken = async (code, id, redirectURI, exchange = 'qt') => {
  const originatingAuthURL = redirectURI || REDIRECT_URI();

  let url;
  let dataFileName;

  if (exchange === 'qt') {
    url = `${QT_DOMAIN()}?client_id=${QT_CLIENT_ID()}&code=${code}&redirect_uri=${originatingAuthURL}&grant_type=authorization_code`;
    dataFileName = AUTH_DATA_FILENAME();
  } else if (exchange === 'cb') {
    const clientId = await CB_CLIENT_ID();
    const clientSecret = await CB_CLIENT_SECRET();
    url = `${CB_DOMAIN()}?client_id=${clientId}&code=${code}&client_secret=${clientSecret}&redirect_uri=${originatingAuthURL}&grant_type=authorization_code`;
    dataFileName = CB_AUTH_DATA_FILENAME();
  }

  try {
    const response = await axios.post(url);
    const authExchangeData = response.data;

    if (exchange === 'qt') {
      authExchangeData.timestamp = +new Date();
    } else if (exchange === 'cb') {
      authExchangeData.timestamp = authExchangeData.created_at;
    }

    await putObject(
      JSON.stringify(authExchangeData, null, 2),
      BUCKET_NAME(),
      `${id}/${dataFileName}`,
    );

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  getCredentialsTokenFromStorage,
  refreshAccessToken,
  exchangeAuthCodeForAccessToken,
};
