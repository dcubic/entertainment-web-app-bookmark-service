const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const BookmarksRouter = require("../routers/BookmarksRouter");
const {
  checkRequiredParameters,
  handleErrors,
  checkJWTValidity,
} = require("../utils/middleware");

if (process.env.NODE_ENV === "dev") {
  dotenv.config();

  const requiredEnvironmentVariables = ["USER_SERVICE_URL", "MONGO_URI", "JWT_SECRET"];
  for (const requiredVariable of requiredEnvironmentVariables) {
    if (!process.env[requiredVariable]) {
      console.error(
        `Error: Environment variable ${requiredVariable} is not set`
      );
      process.exit(1);
    }
  }
}

const bookmarksRouter = new BookmarksRouter();

const app = express();
app.use(bodyParser.json());
app.use(
  "/users/:userId/bookmarks",
  checkRequiredParameters(["userId"]),
  checkJWTValidity,
  bookmarksRouter.getRouter(),
  handleErrors
);

module.exports = app;
