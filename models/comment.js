const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  postedOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tweet",
    required: true,
  },
});

mongoose.model("Comment", CommentSchema);
