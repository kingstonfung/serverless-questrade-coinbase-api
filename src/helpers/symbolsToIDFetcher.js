const axios = require('axios');

const symbolsToQuestradeId = async (authInfo, symbols) => {
  try {
    const { access_token, api_server, token_type } = authInfo;
    const url = `${api_server}v1/symbols?names=${symbols}`;
    const headers = { 'Authorization': `${token_type} ${access_token}` };
    const { data } = await axios.get(url, { headers });

    return data.symbols.map(symbol => symbol.symbolId);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

module.exports = { symbolsToQuestradeId };
