const mongoose = require("mongoose");

const userHandler = require("../handlers/userHandler");
const bookmarksHandler = require("../handlers/bookmarksHandler");
const dbConnector = require("../database/database");

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("getBookmarks", () => {
  it("error case - no such user exists", async () => {
    const nonexistentUserId = new mongoose.Types.ObjectId();

    try {
      await bookmarksHandler.getBookmarks(nonexistentUserId.toString());
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual({
        status: 404,
        message: `No user with id \"${nonexistentUserId.toString()}\"`,
      });
    }
  });

  it("success case - no bookmarks", async () => {
    const user = await userHandler.createUser("email@pizza.com", "password123");
    const bookmarks = await bookmarksHandler.getBookmarks(user.id);
    expect(bookmarks).toHaveLength(0);
  });

  it("success case - two bookmarks", async () => {
    const user = await userHandler.createUser("email@pizza.com", "password123");
    const expectedBookmarks = ["abcdef", "ghijkl"];
    for (const title of expectedBookmarks) {
      await bookmarksHandler.addBookmark(user.id, title);
    }

    const bookmarks = await bookmarksHandler.getBookmarks(user.id);
    expect(bookmarks).toEqual(expectedBookmarks);
  });
});

describe("addBookmark", () => {
  it("success case", async () => {
    const user = await userHandler.createUser("pizza@hotdog.com", "password");
    const title = "Potato";

    try {
      await bookmarksHandler.addBookmark(user.id, title);
      const bookmarks = await bookmarksHandler.getBookmarks(user.id);
      const expectedBookmarks = [title];
      expect(bookmarks).toEqual(expectedBookmarks);
    } catch (error) {
      expect(true).toBe(false);
    }
  });

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
      await bookmarksHandler.addBookmark(user.id, title);
      expect(true).toBe(false); // Shouldn't reach this
    } catch (error) {
      const sortErrors = (a, b) => a.fieldName.localeCompare(b.fieldName);

      const expectedError = {
        status: 409,
        errors: [
          {
            fieldName: "title",
            message:
              "Error, expected `title` to be unique. Value: `Flappy Wappy`",
            kind: "unique",
          },
          {
            fieldName: "userId",
            message:
              "Error, expected `userId` to be unique. Value: `" +
              `${user.id}` +
              "`",
            kind: "unique",
          },
        ],
      };

      error.errors.sort(sortErrors);
      expectedError.errors.sort;

      expect(error).toEqual(expectedError);
    }
  });
});

describe("deleteBookmarkByTitle", () => {
  it("error case - no such user exists", async () => {
    const nonexistentUserId = new mongoose.Types.ObjectId();
    try {
      await bookmarksHandler.deleteBookmarkByTitle(
        nonexistentUserId.toString(),
        "FAKE_TITLE"
      );
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual({
        status: 404,
        message: `No user with id \"${nonexistentUserId.toString()}\"`,
      });
    }
  });

  it("error case - no such bookmark exists", async () => {
    const user = await userHandler.createUser("email@email.com", "pass");
    try {
      await bookmarksHandler.deleteBookmarkByTitle(user.id, "FAKE_TITLE");
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual({
        status: 404,
        message: `Bookmark with title \"FAKE_TITLE\" not found`,
      });
    }
  });

  it("success case - bookmark successfully deleted", async () => {
    const user = await userHandler.createUser("email@email.com", "pass");
    const title = "BookmarkTitle";
    await bookmarksHandler.addBookmark(user.id, title);

    const expectedBookmarks = [title];
    const bookmarksBeforeDeletion = await bookmarksHandler.getBookmarks(
      user.id
    );
    expect(bookmarksBeforeDeletion).toEqual(expectedBookmarks);

    await bookmarksHandler.deleteBookmarkByTitle(user.id, title);
    const bookmarksPostDeletion = await bookmarksHandler.getBookmarks(user.id);
    expect(bookmarksPostDeletion).toHaveLength(0);
  });
});
