module.exports = {
  SQLConnectException: function SQLConnectException(message) {
    this.message = message;
  },
  SQLExecuteException: function SQLExecuteException(message) {
    this.message = message;
  },
  SQLLoginException: function SQLExecuteException(message) {
    this.message = message;
  },
  CaptchaException: function(message) {
    this.message = message;
  },
  QRCodeException: function(message) {
    this.message = message;
  }
};