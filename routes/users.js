const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const { checkRequiredParameters } = require("../utils/middleware");
const userHandler = require("../handlers/userHandler");

router.post(
  "/",
  [
    body("email")
      .exists()
      .withMessage("Email is required")
      .isNotEmpty()
      .withMessage("Email cannot be empty")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password")
      .exists()
      .withMessage("password is required")
      .isNotEmpty()
      .withMessage("Password cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;

    try {
      // const createdUser = await userHandler.createUser(email, password);
    } catch (error) {}
  }
);

router.get("/:userId", checkRequiredParameters(["userId"]), (req, res) => {
  const userId = req.params.userId;
});

router.delete(
  "/:userId",
  checkRequiredParameters(["userId"], (req, res) => {
    const userId = req.params.userId;
  })
);

module.exports = router;
