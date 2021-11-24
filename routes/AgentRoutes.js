const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
const {
  register,
  verify_email,
  login,
  googleLogin,
} = require("../services/AgentServices");
//Register user
router.post(
  "/",
  [
    check("email", "Please provide a valid email.")
      .exists()
      .isEmail()
      .normalizeEmail(),
    check("password", "This password should be 3+ character long.")
      .exists()

      .isLength({ min: 3 }),
    check("agent_name", "This field should be 3+ character long.")
      .exists()
      .isLength({ min: 3 }),
    check("address", "Please provide a valid address.")
      .exists()
      .isLength({ min: 10 }),
  ],
  register
);

//verify email
router.get("/activate/:id", verify_email);

//login
router.post("/login", login);

//userLogin with Google
router.post("/googleLogin", googleLogin);

module.exports = router;
