const isAuthTokenExpired = ({ timestamp, expires_in }) => (
  +new Date() >= (timestamp + (expires_in * 5000))
);

module.exports = { isAuthTokenExpired };
