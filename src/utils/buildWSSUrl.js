const buildWSSUrl = (server, port, ids) => {
  const wss = server.replace(/https/ig, 'wss');
  const wssWithPort = `${wss.substring(0, wss.length - 1)}:${port}`;
  return `${wssWithPort}/v1/markets/quotes/?stream=true&mode=WebSocket&ids=${ids}`;
};

module.exports = { buildWSSUrl };
