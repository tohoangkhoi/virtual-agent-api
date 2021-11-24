const jwt = require("jsonwebtoken");
const { SECRET } = require("../app.properties");

const validateToken = (req, res, next) => {
  //check if there is any token sent from the request
  const accessToken = req.header("accessToken");
  console.log("middleWare", accessToken);

  if (!accessToken) return res.status(400).send({ msg: "User not logged in" });

  //verify the token
  try {
    const validToken = jwt.verify(accessToken, SECRET); //return true or false
    req.user = validToken;
    //if the token is verified, process the request
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.status(400).send({ error: err });
  }
};

module.exports = { validateToken };
