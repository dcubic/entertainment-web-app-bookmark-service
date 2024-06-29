const BookmarkModel = require("../../src/database/bookmarks/bookmark");
const BookmarksDatabase = require("../../src/database/bookmarks/BookmarksDatabase");
const dbConnector = require("../../src/database/DatabaseConnector");
const BookmarksHandler = require("../../src/handlers/BookmarksHandler");
const {
  ConflictingResourceError,
  BookmarkNotFoundError,
} = require("../../src/utils/errors");

const bookmarksDatabase = new BookmarksDatabase();
const bookmarksHandler = new BookmarksHandler();

beforeAll(async () => await dbConnector.connect());

afterEach(async () => await dbConnector.clearDatabase());

afterAll(async () => await dbConnector.closeDatabase());

describe("getBookmarks", () => {
  it("success case - no bookmarks exist for specified user", async () => {
    const userId = "Bilbo";
    const bookmarks = await bookmarksHandler.getBookmarks(userId);

    expect(bookmarks).toHaveLength(0);
  });

  it("success case - several bookmarks exist for the specified user", async () => {
    const userId = "Windex";
    const titles = [
      "TITLE1",
      "PHONE",
      "NAIL_CLIPPERS",
      "MECHANICAL PENCIL",
      "LAPTOP",
      "LIGHT",
      "SUNLAMP",
      "ERASER",
    ];
    for (const title of titles) {
      await bookmarksDatabase.createBookmark(userId, title);
    }

    const bookmarks = await bookmarksHandler.getBookmarks(userId);
    expect(bookmarks.sort()).toStrictEqual(titles.sort());
  });
});

describe("createBookmark", () => {
  it("error case - a bookmark with the same title for the specified user already exists", async () => {
    const userId = "USER123";
    const title = "TITLE";

    await bookmarksDatabase.createBookmark(userId, title);

    await expect(bookmarksHandler.addBookmark(userId, title)).rejects.toThrow(
      new ConflictingResourceError("Bookmark already exists")
    );
  });

  it("success case", async () => {
    const userId = "USER123";
    const title = "TITLE";

    await bookmarksHandler.addBookmark(userId, title);
    const bookmarks = await bookmarksDatabase.getBookmarks(userId);
    expect(bookmarks).toStrictEqual([title]);
  });
});

describe("deleteBookmark", () => {
  it("error case - no existing bookmark matches userId", async () => {
    const otherUserId = "ESKIMO";
    const sharedBookmarkTitle = "PIZZA";
    await bookmarksHandler.addBookmark(otherUserId, sharedBookmarkTitle);

    const targetUserId = "ADVIL";
    await expect(
      bookmarksHandler.deleteBookmark(targetUserId, sharedBookmarkTitle)
    ).rejects.toThrow(
      new BookmarkNotFoundError(
        `Bookmark with title \"${sharedBookmarkTitle}\" not found`
      )
    );

    const bookmarks = await bookmarksDatabase.getBookmarks(otherUserId);
    expect(bookmarks).toStrictEqual([sharedBookmarkTitle]);
  });

  it("error case - no existing bookmark matches title", async () => {
    const sharedUserId = "CLEAR PLUS";
    const otherBookmarkTitle = "ARASFFEWFA";

    await bookmarksDatabase.createBookmark(sharedUserId, otherBookmarkTitle);

    const targetBookmarkTitle = "SFAS";
    await expect(
      bookmarksHandler.deleteBookmark(sharedUserId, targetBookmarkTitle)
    ).rejects.toThrow(
      new BookmarkNotFoundError(
        `Bookmark with title \"${targetBookmarkTitle}\" not found`
      )
    );

    const bookmarks = await bookmarksDatabase.getBookmarks(sharedUserId);
    expect(bookmarks).toStrictEqual([otherBookmarkTitle]);
  });

  it("success case", async () => {
    const user1Id = "PIZZA";
    const user2Id = "POP";

    const title = "CONSUME";

    await bookmarksDatabase.createBookmark(user1Id, title);
    await bookmarksDatabase.createBookmark(user2Id, title);

    await bookmarksHandler.deleteBookmark(user1Id, title);

    const bookmarksUser1 = await bookmarksHandler.getBookmarks(user1Id);
    const bookmarksUser2 = await bookmarksHandler.getBookmarks(user2Id);

    expect(bookmarksUser1).toStrictEqual([]);
    expect(bookmarksUser2).toStrictEqual([title]);
  });
});
