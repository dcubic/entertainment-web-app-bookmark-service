const BookmarksDatabase = require("../database/bookmarks/BookmarksDatabase");

class BookmarksHandler {
  #bookmarksDatabase = new BookmarksDatabase();

  async getBookmarks(userId) {
    const bookmarks = await this.#bookmarksDatabase.getBookmarks(userId);
    return bookmarks;
  }

  async addBookmark(userId, title) {
    await this.#bookmarksDatabase.createBookmark(userId, title);
  }

  async deleteBookmark(userId, title) {
    await this.#bookmarksDatabase.deleteBookmark(userId, title);
  }
}

module.exports = BookmarksHandler;
