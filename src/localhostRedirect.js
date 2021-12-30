module.exports.handler = async event => {
  let authCode;
  const code = event.queryStringParameters.code;
  
  if (event.headers.Referer.includes("coinbase")) {
    authCode = `cbCode=${code}`;
  } else {
    authCode = `code=${code}`;
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `
      <html>
        <head>
          <script>
            window.location.replace("http://localhost:3000?${authCode}");
          </script>
        </head>
        <body></body>
      </html>
    `,
  };
};
