const express = require("express");

const router = express.Router();
const { checkRequiredParameters } = require("../utils/middleware");
const userHandler = require("../handlers/userHandler");

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    // const createdUser = await userHandler.createUser(email, password);
  } catch (error) {
  }
});

router.get("/:userId", checkRequiredParameters(["userId"]), (req, res) => {
  const userId = req.params.userId;
});

router.delete("/:userId", checkRequiredParameters(["userId"], (req, res) => {
  const userId = req.params.userId;
}))

module.exports = router;
