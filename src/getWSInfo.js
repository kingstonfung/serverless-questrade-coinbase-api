const { getCredentialsTokenFromStorage, refreshAccessToken } = require('./helpers/authTokenHelpers');
const { authWSStreamingPort } = require('./helpers/authWSStreamingPort');
const { symbolsToQuestradeId } = require('./helpers/symbolsToIDFetcher') ;
const { GENERIC_ERROR_MESSAGE } = require('./utils/constants');
const { isAuthTokenExpired } = require('./utils/isTokenExpired');
const { buildWSSUrl } = require('./utils/buildWSSUrl');
const { retrieveAccounts, retrieveAllAccountsInfo } = require('./helpers/accountHelpers');

module.exports.handler = async event => {
  try {
    let symbols;
    let hash;
    let questradeIDs;
    let reqMethod = event.method || event.httpMethod;
    
    if (reqMethod === 'POST') {
      ({ symbols, hash } = JSON.parse(event.body));
    } else if (reqMethod === 'GET') {
      symbols = event.queryStringParameters && event.queryStringParameters.symbols;
      hash = event.queryStringParameters && event.queryStringParameters.hash;
    }

    if (!hash || hash === '') throw new Error(GENERIC_ERROR_MESSAGE());

    let authInfo = await getCredentialsTokenFromStorage(hash);
    if (!symbols || symbols === '') {
      questradeIDs = [];

      const { accounts } = await retrieveAccounts(authInfo);
      const allAccountPositions = await retrieveAllAccountsInfo(accounts, authInfo, 'positions');
      
      allAccountPositions.forEach(account => {
        account.positions.forEach(position => questradeIDs.push(position.symbolId));
      });

      console.log('questradeIDs', questradeIDs);
    }
    
    if (isAuthTokenExpired(authInfo)) {
      authInfo = await refreshAccessToken(authInfo.refresh_token, hash);
    }

    if (symbols && symbols !== '') {
      questradeIDs = await symbolsToQuestradeId(authInfo, symbols);
    }

    if (!questradeIDs) throw new Error(GENERIC_ERROR_MESSAGE());

    const questradeIDsComma = questradeIDs.join(',');
    const streamPort = await authWSStreamingPort(authInfo, questradeIDsComma);

    const payload = {
      url: buildWSSUrl(authInfo.api_server, streamPort, questradeIDsComma),
      key: authInfo.access_token,
    };

    if (reqMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html>
            <head>
              <meta http-equiv="Refresh" content="1799">
              <style>
                div { color: #6f521c; font-family: Arial; font-size: 20px; };
              </style>
              <script>
                function startWS() {
                  const ws = new WebSocket('${payload.url}');

                  let firstRun = false;
                  let msgCount = 0;
  
                  ws.onopen = () => {
                    document.body.innerHTML = '';
                    ws.send('${payload.key}');

                    window.addEventListener('beforeunload', () => { ws.close() });
                  }
                  
                  ws.onmessage = event => {
                    const data = JSON.parse(event.data);
                    if (data.success) {
                      firstRun = true;
                      return;
                    }

                    const nowStr = new Date().toString().substring(4, 24);

                    data.quotes.forEach(quote => {
                      if (firstRun) {
                        document.body.innerHTML+= \`
                          <div id="q-\${quote.symbolId}">
                            <p>(\${msgCount}) \${quote.symbol} :: $\${quote.lastTradePrice} -- \${nowStr}</p>
                          </div>
                        \`;
                      } else {
                        document.querySelector(\`#q-\${quote.symbolId}\`).innerHTML = \`<p>(\${msgCount}) \${quote.symbol} :: $\${quote.lastTradePrice} -- \${nowStr}</p>\`;
                      }
                    });
                    
                    firstRun = false;
                    msgCount++;
                  }  
                }
                
                startWS();
              </script>
            </head>
            <body></body>
          </html>
        `,
      };
    } else if (reqMethod === 'POST') {
      return { statusCode: 200, body: JSON.stringify(payload) }
    }
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: error.message }, null, 2),
    };
  }
};
