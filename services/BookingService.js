const { Bookings, Users } = require("../models");
const nodemailer = require("nodemailer");
const { USERNAME, PASSWORD } = require("../app.properties");

exports.book = async (req, res) => {
  const { email } = req.body;
  const booking = req.body;
  const user = await Users.findOne({
    where: {
      email: email,
    },
  }).catch((err) => {
    res.status(500).json(`There is something wrong while finding: ${email}`);
    console.log("Error in finding user:", err);
  });

  if (!user) {
    res.status(400).json(`User ${email} is not exist.`);
  }
  booking.user_id = user.id;
  //Create a booking
  await Bookings.create(booking).catch((err) => res.status(500).json(err));
  res.json("Successfull");
  //Send Mail
  send_booking_detail_to_mail(email);
};

const send_booking_detail_to_mail = (to) => {
  //Credentials of the email used to send the booking details
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
    subject: "Booking Details",
    text: `Hi\n Thank you for booking an appointment on Virtual-agent. Our team will get in touch with you soon. `,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error occurs", err);
    } else {
      console.log("Email sent !!!");
    }
  });
};
