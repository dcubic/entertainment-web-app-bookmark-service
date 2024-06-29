const userHandler = require("../handlers/userHandler");
const BookmarkModel = require("../database/bookmarks/bookmark");
const StatusCode = require('../utils/StatusCode');

const getBookmarks = async (userId) => {
  await throwIfNoUserExists(userId);
  try {
    const bookmarks = await BookmarkModel.find({ userId: userId });
    return bookmarks.map((bookmarkObject) => bookmarkObject.title);
  } catch (error) {
    throw {
      status: StatusCode.SERVER_ERROR,
      message: error.message,
    };
  }
};

const addBookmark = async (userId, title) => {
  await throwIfNoUserExists(userId);

  try {
    const bookmark = new BookmarkModel({ userId, title });
    await bookmark.save();
  } catch (error) {
    if (error.name === "ValidationError") {
      throw {
        status: StatusCode.CONFLICT,
        errors: Object.entries(error.errors).map(([fieldName, error]) => ({
          fieldName: fieldName,
          message: error.message,
          kind: error.kind,
        })),
      };
    } else {
      throw {
        status: StatusCode.SERVER_ERROR,
        message: error.message,
      };
    }
  }
};

const deleteBookmarkByTitle = async (userId, title) => {
  await throwIfNoUserExists(userId);

  try {
    const deletionResult = await BookmarkModel.findOneAndDelete({
      userId: userId,
      title: title,
    });
    if (!deletionResult) {
      throw {
        status: StatusCode.NOT_FOUND,
        message: `Bookmark with title \"${title}\" not found`,
      };
    }
  } catch (error) {
    if (error.status == StatusCode.NOT_FOUND) {
      throw error;
    }
    
    throw {
      status: StatusCode.SERVER_ERROR,
      message: error.message,
    };
  }
};

async function throwIfNoUserExists(userId) {
  try {
    await userHandler.getUserById(userId);
  } catch (error) {
    throw {
      status: StatusCode.NOT_FOUND,
      message: `User with id \"${userId}\" not found`,
    };
  }
}

module.exports = {
  getBookmarks: getBookmarks,
  addBookmark: addBookmark,
  deleteBookmarkByTitle: deleteBookmarkByTitle,
};
