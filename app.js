const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
require("dotenv").config();
require("./models/user");
require("./models/tweet");
require("./models/comment");
require("./models/otp");
const authRouter = require("./routes/auth");
const tweetRouter = require("./routes/tweet");
const UserRouter = require("./routes/user");

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to the DATABASE`);
});
mongoose.connection.on("connected", () => {
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
  console.log(`Connected to the DATABASE`);
});
app.use(
  cors({
    origin: ["http://localhost:3000", "https://ivy-kids-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRouter);
app.use("/tweet", tweetRouter);
app.use("/user", UserRouter);
app.get("/", (req, res) => {
  res.json("hello");
});
