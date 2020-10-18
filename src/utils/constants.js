module.exports = {
  QT_DOMAIN: () => process.env.QT_DOMAIN,
  QT_CLIENT_ID: () => process.env.QT_CLIENT_ID,
  REDIRECT_URI: () => process.env.REDIRECT_URI,
  BUCKET_NAME: () => process.env.BUCKET_NAME,
  AUTH_DATA_FILENAME: () => process.env.AUTH_DATA_FILENAME,
  GET_URL_PUB_KEY: () => process.env.GET_URL_PUB_KEY,
  GENERIC_ERROR_MESSAGE: () => process.env.GENERIC_ERROR_MESSAGE,
  MD5_SCRAMBLE_MULTIPLIER: () => process.env.MD5_SCRAMBLE_MULTIPLIER,
};
