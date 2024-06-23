const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

class DatabaseConnecter {
  constructor() {
    this.mongoServer = null;
  }

  async connect() {
    if (process.env.NODE_ENV === "test") {
      this.mongoServer = await MongoMemoryServer.create();
      const uri = this.mongoServer.getUri();
      await mongoose.connect(uri);
    } else {
      const uri =
        process.env.MONGO_URI ||
        "mongodb+srv://dcubic:PVOpLHciOg9OZGVr@freecluster.h1hyyzp.mongodb.net/users?retryWrites=true";
      await mongoose.connect(uri);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    if (this.mongoServer) {
      await this.mongoServer.stop();
    }
  }
}

const dbConnector = new DatabaseConnecter();

module.exports = dbConnector;
