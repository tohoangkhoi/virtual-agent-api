const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
const { book } = require("../services/BookingService");

//Register user
router.post("/", book);

module.exports = router;
