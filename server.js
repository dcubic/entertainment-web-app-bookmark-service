const dbConnector = require('./src/database/DatabaseConnector')
const app = require("./src/app/app");

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
