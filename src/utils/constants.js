const { getSecretValue } = require('./secretsManagerHelper');

module.exports = {
  QT_DOMAIN: () => process.env.QT_DOMAIN,
  QT_CLIENT_ID: () => process.env.QT_CLIENT_ID,
  REDIRECT_URI: () => process.env.REDIRECT_URI,
  BUCKET_NAME: () => process.env.BUCKET_NAME,
  AUTH_DATA_FILENAME: () => process.env.AUTH_DATA_FILENAME,
  GET_URL_PUB_KEY: () => process.env.GET_URL_PUB_KEY,
  GENERIC_ERROR_MESSAGE: () => process.env.GENERIC_ERROR_MESSAGE,
  MD5_SCRAMBLE_MULTIPLIER: () => process.env.MD5_SCRAMBLE_MULTIPLIER,
  LOCALHOST_OVERRIDE_PATH: () => process.env.LOCALHOST_OVERRIDE_PATH,
  CB_AUTH_DATA_FILENAME: () => process.env.CB_AUTH_DATA_FILENAME,
  CB_DOMAIN: () => process.env.CB_DOMAIN,
  CB_CLIENT_ID: async () => Promise.resolve((await getSecretValue("cbClientId")).SecretString),
  CB_CLIENT_SECRET: async () => Promise.resolve((await getSecretValue("cbClientSecret")).SecretString),
  CB_API_PATH: () => process.env.CB_API_PATH,
  CB_API_VERSION: () => process.env.CB_API_VERSION,
};
