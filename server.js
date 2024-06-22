const express = require("express");
const bodyParser = require("body-parser");

const usersRouter = require('./routes/users');
const bookmarksRouter = require('./routes/bookmarks');

const app = express();
app.use(bodyParser.json());
app.use('/users', usersRouter);
app.use('/users/:userId/bookmarks', checkRequiredParameters(["userId"]), bookmarksRouter);

const port = 8000;

app.use()
app.listen(port);
