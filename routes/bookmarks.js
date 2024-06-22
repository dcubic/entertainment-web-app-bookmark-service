const express = require("express");
const router = express.Router();
const { checkRequiredParameters } = require("../utils/middleware");

router.get("/", (req, res) => {
  const userId = req.params.userId;
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
