const mongoose = require("mongoose");
const {
  InternalServerError,
  BookmarkNotFoundError,
} = require("../../utils/errors");
const BookmarkModel = require("../bookmarks/bookmark");
const { ConflictingResourceError } = require("../../utils/errors");

class BookmarksDatabase {
  async getBookmarks(userId) {
    try {
      const bookmarks = await BookmarkModel.find({ userId });
      return bookmarks.map((bookmarkObject) => bookmarkObject.title);
    } catch (error) {
      throw new InternalServerError();
    }
  }

  async createBookmark(userId, title) {
    try {
      const bookmark = new BookmarkModel({ userId, title });
      await bookmark.save();
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ConflictingResourceError("Bookmark already exists");
      }

      throw new InternalServerError();
    }
  }

  async deleteBookmark(userId, title) {
    try {
      const deletionResult = await BookmarkModel.findOneAndDelete({
        userId: userId,
        title: title,
      });
      if (!deletionResult) {
        throw new BookmarkNotFoundError(
          `Bookmark with title \"${title}\" not found`
        );
      }
    } catch (error) {
      if (error instanceof BookmarkNotFoundError) {
        throw error;
      }
      throw new InternalServerError();
    }
  }
}

module.exports = BookmarksDatabase;
