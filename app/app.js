const express = require("express");
const bodyParser = require("body-parser");

const usersRouter = require("../routes/users");
const bookmarksRouter = require("../routes/bookmarks");
const { checkRequiredParameters } = require("../utils/middleware");

const app = express();
app.use(bodyParser.json());
app.use("/users", usersRouter);
app.use(
  "/users/:userId/bookmarks",
  checkRequiredParameters(["userId"]),
  bookmarksRouter
);

module.exports = app;