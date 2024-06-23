const express = require("express");
const router = express.Router();

const { checkRequiredParameters } = require("../utils/middleware");
const bookmarksHandler = require("../handlers/bookmarksHandler");

router.get("/", async (req, res) => {
  const userId = req.params.userId;

  try {
    // const bookmarks = await bookmarksHandler.getBookmarks(userId);
  } catch(error) {
    
  }

});

router.post(
  "/:bookmarkId",
  checkRequiredParameters(["bookmarkId"]),
  (req, res) => {
    const { userId, bookmarkId } = req.params;
  }
);

router.delete(
  "/:bookmarkId",
  checkRequiredParameters(["bookmarkId"]),
  (req, res) => {
    const { userId, bookmarkId } = req.params;
  }
);

module.exports = router;
