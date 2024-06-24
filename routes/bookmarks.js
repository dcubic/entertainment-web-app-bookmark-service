const express = require("express");
const router = express.Router({ mergeParams: true });

const { checkRequiredParameters } = require("../utils/middleware");
const bookmarksHandler = require("../handlers/bookmarksHandler");
const StatusCode = require("../utils/statuscode");

router.get("/", (req, res) => {
  console.log("api parameters: ", req.params)
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
  "/"),
  (req, res) => {
    const { userId, title } = req.params;
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
