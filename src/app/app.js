const express = require("express");
const bodyParser = require("body-parser");

const usersRouter = require("../routes/users");
const bookmarksRouter = require("../routes/bookmarks");
const { checkRequiredParameters } = require("../utils/middleware");

if (process.env.NODE_ENV !== "prod") {
  dotenv.config();
}

const requiredEnvironmentVariables = ["USER_SERVICE_URL", "MONGO_URI"];
for (const requiredVariable of requiredEnvironmentVariables) {
  if (!process.env[requiredVariable]) {
    console.error(`Error: Environment variable ${requiredVariable} is not set`);
    process.exit(1);
  }
}

const app = express();
app.use(bodyParser.json());
app.use(
  "/users/:userId/bookmarks",
  checkRequiredParameters(["userId"]),
  bookmarksRouter
);

module.exports = app;
