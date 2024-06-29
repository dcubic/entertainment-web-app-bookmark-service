const StatusCode = require("./StatusCode");

class ServerError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

class InvalidParameterError extends ServerError {
  constructor(message, statusCode = StatusCode.BAD_REQUEST) {
    super(statusCode, message);

    this.name = "InvalidParameterError";
    Object.setPrototypeOf(this, InvalidParameterError.prototype);
  }
}

class AuthenticationError extends ServerError {
  constructor(
    statusCode = StatusCode.UNAUTHORIZED,
    message = "Invalid Credentials"
  ) {
    super(statusCode, message);

    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Might confuse someone with this
 */
class AuthorizationError extends ServerError {
  constructor(
    statusCode = StatusCode.FORBIDDEN,
    message = "Not Authorized to perform this operation"
  ) {
    super(statusCode, message);

    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

class BookmarkNotFoundError extends ServerError {
  constructor(message, statusCode = StatusCode.NOT_FOUND) {
    super(statusCode, message);

    this.name = "BookmarkNotFoundError";
    Object.setPrototypeOf(this, BookmarkNotFoundError.prototype);
  }
}

class ConflictingResourceError extends ServerError {
  constructor(message = "Resource Conflict", statusCode = StatusCode.CONFLICT) {
    super(statusCode, message);

    this.name = "ConflictingResourceError";
    Object.setPrototypeOf(this, ConflictingResourceError.prototype);
  }
}

class InternalServerError extends ServerError {
  constructor(
    statusCode = StatusCode.INTERNAL_SERVER_ERROR,
    message = "Something went wrong"
  ) {
    super(statusCode, message);

    this.name = "InternalServerError";
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

module.exports = {
  ServerError,
  InvalidParameterError,
  AuthenticationError,
  AuthorizationError,
  BookmarkNotFoundError,
  ConflictingResourceError,
  InternalServerError,
};
