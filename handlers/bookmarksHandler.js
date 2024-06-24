const userHandler = require("../handlers/userHandler");
const BookmarkModel = require("../models/bookmark");

const getBookmarks = async (userId) => {
  await throwIfNoUserExists(userId);
  try {
    const bookmarks = await BookmarkModel.find({ userId: userId });
    return bookmarks.map((bookmarkObject) => bookmarkObject.title);
  } catch (error) {
    throw {
      status: 500,
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
        status: 409,
        errors: Object.entries(error.errors).map(([fieldName, error]) => ({
          fieldName: fieldName,
          message: error.message,
          kind: error.kind,
        })),
      };
    } else {
      throw {
        status: 500,
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
        status: 404,
        message: `Bookmark with title \"${title}\" not found`,
      };
    }
  } catch (error) {
    if (error.status == 404) {
      throw error;
    }
    
    throw {
      status: 500,
      message: error.message,
    };
  }
};

async function throwIfNoUserExists(userId) {
  try {
    await userHandler.getUserById(userId);
  } catch (error) {
    throw {
      status: 404,
      message: `No user with id \"${userId}\"`,
    };
  }
}

module.exports = {
  getBookmarks: getBookmarks,
  addBookmark: addBookmark,
  deleteBookmarkByTitle: deleteBookmarkByTitle,
};
