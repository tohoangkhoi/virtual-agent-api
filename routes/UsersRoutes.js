const express = require("express");
const router = express.Router();

const {
  register,
  verify_email,
  login,
  googleLogin,
} = require("../services/UserServices");
const { check } = require("express-validator");
//Register user
router.post(
  "/",
  [
    check("email", "Please provide a valid email.")
      .exists()
      .isEmail()
      .normalizeEmail(),
    check("password", "This password should be 3+ charter long.")
      .exists()

      .isLength({ min: 3 }),
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
