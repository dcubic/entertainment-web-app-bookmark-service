const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();
const { checkRequiredParameters } = require("../utils/middleware");

router.post(
  "/",
  (req, res) => {
    const { email, password } = req.body;
  }
);

router.get(
    "/:userId",
    checkRequiredParameters(["userId"]),
    (req, res) => {
        const userId = req.params.userId;
    }
)

module.exports = router;
