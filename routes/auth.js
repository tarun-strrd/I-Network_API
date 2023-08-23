const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Otp = mongoose.model("Otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkLogin = require("../middleware/checkLogin");
const EMAIL = process.env.NODE_EMAIL;
const PASSWORD = process.env.NODE_PASS;
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  console.log("signup inside");
  //console.log(req.body);
  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please add all required feilds" });
  }
  User.findOne({ email: email })
    .then((foundUser) => {
      if (foundUser) {
        return res.status(422).json({ error: "User already exists" });
      }
      bcrypt.hash(password, 12).then((hashedPass) => {
        const user = new User({
          email,
          password: hashedPass,
          name,
        });

        user
          .save()
          .then((user) => {
            res.json({ msg: "SignUp Successful" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/sendOtp", (req, res) => {
  console.log("sendOtp");
  const email = req.body.email;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.json({ msg: "You will receive an email if user exists" });
      }
      const otpCode = Math.floor(Math.random() * 10000 + 1);
      const otpData = new Otp({
        email,
        code: otpCode,
        expiryIn: new Date().getTime() + 3600 * 1000,
      });
      otpData
        .save()
        .then((otp) => {
          mailSender(email, otp.code);
          res.json({ msg: "You will receive an email if user exists" });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.post("/resetpassword", async (req, res) => {
  req.body.otp = parseInt(req.body.otp);
  console.log(req.body);
  Otp.findOne({ email: req.body.email, code: req.body.otp })
    .then((data) => {
      let currentTime = new Date().getTime();
      let diff = data.expiryIn - currentTime;
      if (diff > 0) {
        User.findOne({ email: req.body.email })
          .then((user) => {
            bcrypt
              .hash(req.body.password, 12)
              .then((hashedPass) => {
                console.log(hashedPass);
                user.password = hashedPass;
                user.save();
              })
              .catch((err) => console.log(err));
            return res
              .status(200)
              .json({ msg: "Password successfully changed" });
          })
          .catch((err) => console.log(err));
      } else {
        return res.status(422).json({ error: "Time Limit Exceeded" });
      }
    })
    .catch((err) => {
      return res.status(422).json({ error: "Invalid OTP" });
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Provide all required feilds" });
  }
  User.findOne({ email }).then((savedUser) => {
    if (!savedUser) {
      return res.json({ error: "Invalid email or Password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((isMatch) => {
        if (isMatch) {
          const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
          const {
            name,
            _id,
            email,
            followers,
            following,
            profilePic,
            bio,
            location,
          } = savedUser;
          return res.json({
            token,
            user: {
              _id,
              name,
              email,
              followers,
              following,
              profilePic,
              bio,
              location,
            },
          });
        } else {
          return res.json({ error: "Invalid email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.get("/protected", checkLogin, (req, res) => {
  res.status(200).json("hello,this is proteced");
});

const mailSender = (email, otp) => {
  const config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  };
  let transporter = nodemailer.createTransport(config);
  let message = {
    to: email,
    from: "no-reply@sm.com",
    subject: "OTP for resetting password",
    text: `your OTP for changing password is ${otp}`,
  };
  transporter
    .sendMail(message)
    .then(() => {
      console.log("mail snet");
    })
    .catch((err) => console.log("error", err));
};

module.exports = router;
