const { Agents } = require("../models");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { sign } = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { USERNAME, PASSWORD, SECRET } = require("../app.properties");

exports.register = async (req, res) => {
  const {
    email,
    password,
    confirmPassword,
    avatar,
    first_name,
    last_name,
    agent_name,
    phone,
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
    await Agents.create({
      email: email,
      password: hash,
      first_name: first_name,
      last_name: last_name,
      agent_name: agent_name,
      avatar: avatar,
      phone: phone,
      address: address,
      is_verified: false,
    })
      .then(() => {
        res.json("Success");

        send_activation_link(email);
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

  const agent = await Agents.findOne({ where: { email: email } }).catch(
    (err) => {
      res.status(400).send(err.errors);
    }
  );

  if (!agent) {
    res.status(404).send({ param: "email", msg: "Email doesnt match." });
  }

  if (!agent.is_verified) {
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
    res.json(accessToken);
  });
};

exports.googleLogin = async (req, res) => {
  const { email, familyName, givenName } = req.body;
  const agent = await Agents.findOne({ where: { email: email } }).catch((err) =>
    res.status(500).json({ msg: "GoogleLogin Error", err: err })
  );

  //Only alow the google email that does not in the database.
  if (agent) {
    const payload = {
      email: email,
      id: agent.id,
    };
    const accessToken = sign(payload, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json(accessToken);
  }

  //Create token

  const registeredAgent = await Agents.create({
    email: email,
    password: "hash",
    first_name: familyName,
    last_name: givenName,
    agent_name: "name",
    avatar: "avatar",
    phone: "phone",

    address: "address",
    is_verified: true,
  }).catch((err) => {
    res.status(500).json({ param: "CreateGoogleAgent", msg: err });
  });

  const payload = {
    email: email,
    id: registeredAgent.id,
  };
  const accessToken = sign(payload, SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json(accessToken);
};

exports.verify_email = async (req, res) => {
  const user = await Agents.findOne({ where: { email: req.params.id } });
  if (!user) {
    res.json("Agent does not exist");
  }

  await Agents.update(
    { is_verified: true },
    { where: { email: req.params.id } }
  );

  res.json("Sucessfully");
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
    text: `Please click here to activate your email:\n http://localhost:3001/users/activate/${to}`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error occurs", err);
    } else {
      console.log("Email sent !!!");
    }
  });
};
