class AppError extends Error {
  constructor() {
    super();
  }

  create(message, statusCode, httpStatusCode) {
    this.message = message;
    this.statusCode = statusCode;
    this.httpStatusCode = httpStatusCode;

    return this;
  }
}

module.exports = new AppError();
