const express = require("express");
const bodyParser = require("body-parser");

const dbConnector = require("./database/database");
const usersRouter = require("./routes/users");
const bookmarksRouter = require("./routes/bookmarks");
const { checkRequiredParameters } = require("./utils/middleware");

const app = express();
app.use(bodyParser.json());
app.use("/users", usersRouter);
app.use(
  "/users/:userId/bookmarks",
  checkRequiredParameters(["userId"]),
  bookmarksRouter
);

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dbConnector.connect();
    app.listen(port, () => {
      console.log("Server started on port: ", port);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

process.on("SIGINT", async () => {
  await dbConnector.disconnect();
  process.exit(0);
});
