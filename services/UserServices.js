const { Users } = require("../models");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const axios = require("axios");
const { sign } = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { USERNAME, PASSWORD, SECRET } = require("../app.properties");

exports.register = async (req, res) => {
  const {
    email,
    password,
    gender,
    confirmPassword,
    avatar,
    first_name,
    last_name,
    phone,
    home_country,
    address,
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  if (confirmPassword !== password) {
    return res.status(422).json([
      {
        param: "confirmPassword",
        msg: "Password and confirmPassword do not match.",
      },
    ]);
  }

  bcrypt.hash(password, 10).then(async (hash) => {
    await Users.create({
      email: email,
      password: hash,
      first_name: first_name,
      last_name: last_name,
      gender: gender,
      avatar: avatar,
      phone: phone,
      home_country: home_country,
      address: address,
      is_verified: false,
      is_subscribed: false,
      update_profile: false,
    })
      .then(() => {
        try {
          send_activation_link(email);

          res.status(200).json("Success");
        } catch (err) {
          console.log(err);
          res.status(500).json({ message: err });
        }
      })
      .catch((exception) => {
        exception.errors.map((err) => {
          if (err.message === "email must be unique") {
            res
              .status(400)
              .send([{ param: "email", msg: "Email is already taken." }]);
          } else {
            res.status(400).json([{ name: err.path, message: err.message }]);
          }
        });
      });
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ where: { email: email } }).catch((err) => {
    res.status(400).send(err);
  });
  //meet.google.com/jqc-etjr-hfz
  https: if (!user) {
    res.status(404).send({ param: "email", msg: "Email doesnt match." });
  }

  if (user.is_verified == false) {
    res.status(404).send({
      param: "email",
      msg: "You have not activate your account.",
    });
  }

  //Verify the password from the request
  bcrypt.compare(password, user.password).then((match) => {
    if (!match)
      res.status(404).send({ param: "password", msg: "Wrong password." });

    //Create token
    const payload = {
      email: user.email,
      id: user.id,
    };
    const accessToken = sign(payload, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      accessToken: accessToken,
    });
  });
};

exports.googleLogin = async (req, res) => {
  const { email, familyName, givenName } = req.body;
  const user = await Users.findOne({ where: { email: email } }).catch((err) =>
    res.status(500).json({ msg: "GoogleLogin Error", err: err })
  );

  //Only alow the google email that does not in the database.
  if (user) {
    const payload = {
      email: email,
      id: user.id,
    };
    const accessToken = sign(payload, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ accessToken: accessToken });
  }

  //Create token

  const registeredUser = await Users.create({
    email: email,
    password: "hash",
    first_name: familyName,
    last_name: givenName,
    gender: "gender",
    avatar: "avatar",
    phone: "phone",
    home_country: "home_country",
    address: "address",
    is_verified: true,
    is_subscribed: false,
    update_profile: false,
  }).catch((err) => {
    res.status(500).json({ param: "CreateGoogleUser", msg: err });
  });

  const payload = {
    email: email,
    id: registeredUser.id,
  };

  const accessToken = sign(payload, SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json(accessToken);
};

exports.verify_email = async (req, res) => {
  const user = await Users.findOne({
    where: { email: req.params.id },
  }).catch((err) => {
    res.json(err);
    console.log("error in finding user:", err);
  });
  if (!user) {
    res.json("User does not exist");
  }

  const responseUser = await Users.update(
    { is_verified: true, chat_id: "null" },
    { where: { email: req.params.id } }
  ).catch((err) => {
    console.log("error in updating user:", err);
  });

  res.redirect(
    "http://va-bucket-ui.s3-website-ap-southeast-2.amazonaws.com/verifyRegister"
  );
};

const send_activation_link = (to) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USERNAME,
      pass: PASSWORD,
    },
  });

  let mailOptions = {
    from: "the-virtual-agent-bot@gmail.com",
    to: to,
    subject: "Activation Link",
    text: `
    Dear ${to},\n\n
    Welcome to Virtual Agent. The confidential of your account are as follows:\n\n
    Username: ${to}\n
    
    Thank you for choosing Virtual Agent to accompany you on the migration journey.\n\n
    If you are not expecting this email or if you have any other enquiries, please contact our team on ${USERNAME}.\n
    Kindly regards,\n
    Virtual Agent team.

    Please click here to activate your email:\n http://54.252.135.207:8080/users/activate/${to}`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error occurs", err);
    } else {
      console.log("Email sent !!!");
    }
  });
};
