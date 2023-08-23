const mongoose = require("mongoose");
const tweetSchema = new mongoose.Schema(
  {
    tweet: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);
mongoose.model("Tweet", tweetSchema);
