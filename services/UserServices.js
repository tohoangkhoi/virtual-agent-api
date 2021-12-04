const { Users } = require("../models");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const axios = require("axios");
const { sign } = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const {
  USERNAME,
  PASSWORD,
  SECRET,
  CHAT_ENGINE_PROJECT_SECRET,
} = require("../app.properties");

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
        send_activation_link(email);

        try {
          send_activation_link(email);
          res.status(200).json("Success");
        } catch (err) {
          console.log(err);
          res.status(500).json({ message: err });
        }
      })
      .catch((exception) => {
        res.status(400).json(
          exception.errors.map((err) => {
            if (err.message === "email must be unique") {
              res
                .status(400)
                .send([{ param: "email", msg: "Email is already taken." }]);
            } else {
              res.status(400).json([{ name: err.path, message: err.message }]);
            }
          })
        );
      });
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ where: { email: email } }).catch((err) => {
    res.status(400).send(err);
  });

  if (!user) {
    res.status(404).send({ param: "email", msg: "Email doesnt match." });
  }

  if (!user.is_verified) {
    res
      .status(404)
      .send({ param: "email", msg: "You have not activate your account." });
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
  const user = await Users.findOne({ where: { email: req.params.id } });
  if (!user) {
    res.json("User does not exist");
  }

  //Add User to ChatEngine
  const chatPayload = {
    username: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    secret: user.email,
  };

  await axios
    .post("https://api.chatengine.io/users/", chatPayload, {
      headers: {
        "private-key": CHAT_ENGINE_PROJECT_SECRET,
      },
    })
    .catch((err) => {
      res.status(500).json(err);
    });

  const responseUser = await Users.update(
    { is_verified: true, chat_id: "null" },
    { where: { email: req.params.id } }
  );

  res.json("Successfull");
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
    text: `Please click here to activate your email:\n https://hidden-ridge-11521.herokuapp.com/users/activate/${to}`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error occurs", err);
    } else {
      console.log("Email sent !!!");
    }
  });
};
