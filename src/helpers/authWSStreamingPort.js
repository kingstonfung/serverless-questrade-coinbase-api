const axios = require('axios');

const authWSStreamingPort = async (authInfo, ids) => {
  try {
    const { access_token, api_server, token_type } = authInfo;
    const url = `${api_server}v1/markets/quotes?stream=true&mode=WebSocket&ids=${ids}`;
    const headers = { 'Authorization': `${token_type} ${access_token}` };
    const { data: { streamPort } } = await axios.get(url, { headers });

    return streamPort;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

module.exports = { authWSStreamingPort };
