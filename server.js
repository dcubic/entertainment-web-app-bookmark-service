const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const usersRouter = require('./routes/users');
const bookmarksRouter = require('./routes/bookmarks');
const { checkRequiredParameters } = require('./utils/middleware')

const app = express();
app.use(bodyParser.json());
app.use('/users', usersRouter);
app.use('/users/:userId/bookmarks', checkRequiredParameters(["userId"]), bookmarksRouter);

const port = 8000;

// const oldConnectionString = 'mongodb+srv://dcubic:PVOpLHciOg9OZGVr@freecluster.h1hyyzp.mongodb.net/?retryWrites=true&w=majority&appName=FreeCluster';
mongoose.connect('mongodb+srv://dcubic:PVOpLHciOg9OZGVr@freecluster.h1hyyzp.mongodb.net/users?retryWrites=true').then(result => {
    app.listen(port);
    console.log("Server started on port: ", port);
}).catch(error => console.log(error));
