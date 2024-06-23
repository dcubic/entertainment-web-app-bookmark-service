const BookmarkModel = require("../handlers/bookmarkHandler");

const getBookmarks = async (userId) => {
  throwIfNoUserExists(userId);
  try {
    return await BookmarkModel.find({ userId: userId }).map(
      (bookmarkObject) => bookmarkObject.title
    );
  } catch (error) {
    throw {
      status: 500,
      message: error.message,
    };
  }
};

const addBookmark = async (userId, title) => {
  throwIfNoUserExists(userId);

  try {
    const bookmark = new BookmarkModel(userId, title);
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

const removeBookmarkByTitle = async (userId, title) => {
  throwIfNoUserExists();

  try {
    const deletionResult = await BookmarkModel.findOneAndDelete({
      title: title,
    });
    if (!deletionResult) {
      throw {
        status: 404,
        message: `Bookmark with title \"${title}\" not found`,
      };
    }
  } catch (error) {
    throw {
      status: 500,
      message: error.message,
    };
  }
};

async function throwIfNoUserExists(userId) {
  try {
    await UserModel.getUserById(userId);
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
  deleteBookmarkByTitle: deleteBookmarkByTitle
};
