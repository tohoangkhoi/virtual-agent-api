const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
const port = process.env.PORT || 8080;
const db = require("./models");

//Routers
const userRouter = require("./routes/UsersRoutes");
const agentRouter = require("./routes/AgentRoutes");
const bookingRouter = require("./routes/BookingRoutes.js");
app.use("/users", userRouter);
app.use("/agents", agentRouter);
app.use("/bookings", bookingRouter);

db.sequelize.sync().then(() => {
  //Start the server after go through all the models
  app.listen(port, () => {
    console.log("Server running on port 3001", port);
  });
});
