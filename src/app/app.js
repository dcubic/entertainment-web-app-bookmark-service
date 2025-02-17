const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const HealthRouter = require('../routers/HealthRouter');
const BookmarksRouter = require("../routers/BookmarksRouter");
const {
  checkRequiredParameters,
  handleErrors,
  checkJWTValidity,
} = require("../utils/middleware");

if (process.env.NODE_ENV === "dev") {
  dotenv.config();

  const requiredEnvironmentVariables = ["MONGO_URI", "JWT_SECRET"];
  for (const requiredVariable of requiredEnvironmentVariables) {
    if (!process.env[requiredVariable]) {
      console.error(
        `Error: Environment variable ${requiredVariable} is not set`
      );
      process.exit(1);
    }
  }
}

const healthRouter = new HealthRouter();
const bookmarksRouter = new BookmarksRouter();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(
  "/bookmark/health",
  healthRouter.getRouter(),
  handleErrors
)
app.use(
  "/bookmark/users/:userId/bookmarks",
  checkRequiredParameters(["userId"]),
  checkJWTValidity,
  bookmarksRouter.getRouter(),
  handleErrors
);

module.exports = app;
