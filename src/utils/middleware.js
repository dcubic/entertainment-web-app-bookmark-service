const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator')
const { InvalidParameterError } = require("./errors");
const { JWT_SECRET } = require("../utils/testingconstants");
const { AuthenticationError, AuthorizationError } = require("../utils/errors");

const checkRequiredParameters = (parameters) => (request, response, next) => {
  try {
    const missingParameters = parameters.filter(
      (parameter) => !request.params[parameter]
    );
    if (missingParameters.length > 0) {
      throw InvalidParameterError(
        `Missing parameters: ${missingParameters.join(", ")}`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

const checkJWTValidity = (request, response, next) => {
  try {
    const authorizationHeaderValue = request.headers.authorization;
    if (authorizationHeaderValue === undefined) {
      throw new AuthenticationError();
    }
    const parts = authorizationHeaderValue.split(" ", 2);
    if (parts.length !== 2) {
      throw new AuthenticationError();
    }

    const token = parts[1];
    jwt.verify(
      token,
      process.env.JWT_SECRET || JWT_SECRET,
      (error, decodedToken) => {
        if (error) {
          throw new AuthenticationError();
        } else {
          if (String(request.params.userId) !== String(decodedToken.subject)) {
            throw new AuthorizationError();
          }
          next();
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

const handleValidationErrors = (request, response, next) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      throw new InvalidParameterError(
        errors
          .array()
          .map((error) => error.msg)
          .join(", ")
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

const handleErrors = (error, request, response, next) => {
  response.status(error.statusCode).json({ message: error.message });
};

module.exports = {
  checkRequiredParameters,
  handleValidationErrors,
  handleErrors,
  checkJWTValidity,
};
