const axios = require('axios');
const { putObject, getObject } = require('../utils/s3Helpers');
const {
  BUCKET_NAME,
  AUTH_DATA_FILENAME,
  QT_DOMAIN,
  QT_CLIENT_ID,
  REDIRECT_URI,
} = require('../utils/constants');

const getCredentialsTokenFromStorage = async (id) => {
  const data = await getObject(BUCKET_NAME(), `${id}/${AUTH_DATA_FILENAME()}`);
  const jsonStr = data.Body.toString();
  const authInfo = JSON.parse(jsonStr);
  try {
    return Promise.resolve(authInfo);
  } catch (error) {
    return Promise.reject(error);
  }
};

const refreshAccessToken = async (refreshToken, id) => {
  const url = `${QT_DOMAIN()}?grant_type=refresh_token&refresh_token=${refreshToken}`;

  try {
    const { data: authExchangeData } = await axios.post(url);
    authExchangeData.timestamp = +new Date();

    await putObject(
      JSON.stringify(authExchangeData, null, 2),
      BUCKET_NAME(),
      `${id}/${AUTH_DATA_FILENAME()}`,
    );

    return Promise.resolve(authExchangeData);
  } catch (error) {
    return Promise.reject(error);
  }
};

const exchangeAuthCodeForAccessToken = async (code, id) => {
  const url = `${QT_DOMAIN()}?client_id=${QT_CLIENT_ID()}&code=${code}&redirect_uri=${REDIRECT_URI()}&grant_type=authorization_code`;

  try {
    const response = await axios.post(url);
    const authExchangeData = response.data;
    authExchangeData.timestamp = +new Date();

    await putObject(
      JSON.stringify(authExchangeData, null, 2),
      BUCKET_NAME(),
      `${id}/${AUTH_DATA_FILENAME()}`,
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
