const isAuthTokenExpired = ({ timestamp, expires_in }) => (
  +new Date() >= (timestamp + (expires_in * 1000))
);

module.exports = { isAuthTokenExpired };
