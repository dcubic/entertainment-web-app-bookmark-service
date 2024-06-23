const mongoose = require("mongoose");

const userHandler = require("../handlers/userHandler");
const bookmarksHandler = require("../handlers/bookmarksHandler");
const dbConnector = require("../database/database");

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("addBookmark", () => {
  it("error case - no such userId exists", async () => {
    const nonexistentUserId = new mongoose.Types.ObjectId();
    const title = "Pizza (2016)";

    try {
      await bookmarksHandler.addBookmark(nonexistentUserId, title);
      expect(true).toBe(false); // Shouldn't make it here
    } catch (error) {
      const expectedError = {
        status: 404,
        message: `No user with id \"${nonexistentUserId}\"`,
      };
      expect(error).toEqual(expectedError);
    }
  });

  it("error case - a bookmark with the same userId and title already exists", async () => {
    const user = await userHandler.createUser(
      "pizzaJims@hotdog.com",
      "XxX_D3XL355_XxX"
    );
    const title = "Flappy Wappy";

    await bookmarksHandler.addBookmark(user.id, title);
    try {
        await bookmarkshandler.addBookmark(user.id, title);
        expect(true).toBe(false);
    } catch(error) {
        const expectedError = {
            status: 409,
            errors: []
        }

        
    }
  });
});
