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
  const createdBooking = await Bookings.create(booking).catch((err) =>
    res.status(500).json(err)
  );
  res.json("Successfull");
  //Send Mail
  send_booking_detail_to_mail(email, createdBooking);
};

const send_booking_detail_to_mail = (to, booking) => {
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
    text: `Dear ${to}\n \n 
    This is the confirmation email of the booking appointment on Virtual Agent. The details of your booking are as follows:\n\n
    Booking number: ${booking.id}
    Agent: ${chloe_le}\n
    Time: ${booking.createdAt}\n
    Please note: This booking status is PENDING.\n\n
    When the booking is in review process, the updating status will be sent in a separate email.\n
    You can also contact our agent through our chat application by following these steps:\n
    \t1. Login by a valid account.\n
    \t2. Click the "Contact agent" button at homepage.\n
    \t3. Find the "+" at the "My Chats" (on the top left of your screen) to create your private chat room.\n
    \t4. Locate to "People", at "Type a username", intput our agent name to add him/her to the chat room.\n\n
    
    If you are not expecting this email or if you have any other enquiries, please contact our team on {OurEmail}.\n
    Kindly regards,\n
    Virtual Agent team.
    `,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error occurs", err);
    } else {
      console.log("Email sent !!!");
    }
  });
};
