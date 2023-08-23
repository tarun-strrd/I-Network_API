const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const User = mongoose.model("User");

const checkLogin = (req, res, next) => {
  //console.log(req.headers);
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in!" });
  }
  const token = authorization.replace("Bearer ", "");

  try {
    const decodedDetails = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedDetails);
    const id = decodedDetails.id;
    User.findById(id)
      .then((userData) => {
        req.user = {
          name: userData.name,
          email: userData.email,
          _id: userData._id,
          followers: userData.followers,
          following: userData.following,
          profilePic: userData.profilePic,
        };
        //console.log(req.user);
        next();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    return res.status(402).json({ error: "Some error occured" });
  }
};

module.exports = checkLogin;
