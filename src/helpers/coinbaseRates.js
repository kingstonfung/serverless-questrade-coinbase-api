const axios = require('axios');
const COINBASE_CAD_RATES_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=CAD';

const getCBRates = async () => {
  try {
    const { data: { data } } = await axios.get(COINBASE_CAD_RATES_URL);
    const { rates } = data;
    return Promise.resolve(rates);
  } catch (error) {
    return Promise.reject(error.message);
  }
};

module.exports = { getCBRates };
