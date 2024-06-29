const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router({ mergeParams: true });

const { checkRequiredParameters } = require("../utils/middleware");
const bookmarksHandler = require("../handlers/bookmarksHandler");
const StatusCode = require("../utils/StatusCode");

router.get("/", (req, res) => {
  bookmarksHandler
    .getBookmarks(req.params.userId)
    .then((bookmarks) => {
      res.status(StatusCode.OK).json({
        bookmarks: bookmarks,
      });
    })
    .catch((error) => {
      res.status(error.status).json({
        message: error.message,
      });
    });
});

router.post(
  "/",
  [body("title").notEmpty().withMessage("Bookmark title cannot be empty")],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    bookmarksHandler
      .addBookmark(req.params.userId, title)
      .then(() => res.status(StatusCode.OK).send())
      .catch((error) => {
        res.status(error.status).json({ message: error.message });
      });
  }
);

router.delete(
  "/:bookmarkId",
  checkRequiredParameters(["bookmarkId"]),
  (req, res) => {
    const { userId, bookmarkId } = req.params;

    bookmarksHandler
      .deleteBookmarkByTitle(userId, bookmarkId)
      .then(() => res.status(StatusCode.OK).send())
      .catch((error) => {
        res.status(error.status).json({ message: error.message });
      });
  }
);

module.exports = router;
