const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkLogin = require("../middleware/checkLogin");
const { route } = require("./auth");
const Tweet = mongoose.model("Tweet");
const Comment = mongoose.model("Comment");

router.get("/allTweets", checkLogin, (req, res) => {
  //console.log("allTweets");
  Tweet.find()
    .populate("postedBy", "_id name profilePic")
    .sort("-createdAt")
    .then((tweets) => {
      //console.log(tweets);
      res.status(200).json({ tweets });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/followingPosts", checkLogin, (req, res) => {
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name profilePic")
    .sort("-createdAt")
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/createTweet", checkLogin, (req, res) => {
  const { tweet, pic } = req.body;
  if (!tweet) {
    return res.status(402).json({ error: "Provide all feilds" });
  }
  const new_tweet = new Tweet({
    tweet,
    pic,
    postedBy: req.user._id,
  });

  new_tweet
    .save()
    .then((savedTweet) => {
      Tweet.find({ _id: savedTweet._id })
        .populate("postedBy", "_id name profilePic")
        .then((tweet) => {
          console.log(tweet);
          return res.status(201).json({ tweet });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/likedTweets", checkLogin, (req, res) => {
  Tweet.find({ likes: req.user._id })
    .populate("postedBy", "_id name profilePic")
    .then((tweets) => {
      res.status(200).json({ tweets });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/myTweets", checkLogin, (req, res) => {
  Tweet.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name profilePic")
    .then((myTweets) => {
      res.json({ myTweets });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/like", checkLogin, (req, res) => {
  //console.log("like");
  Tweet.findByIdAndUpdate(
    req.body.tweetId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name profilePic")
    .then((tweet) => {
      return res.json({ tweet });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

router.put("/unlike", checkLogin, (req, res) => {
  //console.log("unlike");
  Tweet.findByIdAndUpdate(
    req.body.tweetId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name profilePic")
    .then((tweet) => {
      return res.json({ tweet });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

router.post("/comment", checkLogin, (req, res) => {
  //console.log("comment");
  const comment = new Comment({
    comment: req.body.comment,
    postedOn: req.body.tweetId,
    postedBy: req.user._id,
  });
  comment
    .save()
    .then((savedComment) => {
      //console.log(savedComment);
      Tweet.findByIdAndUpdate(
        req.body.tweetId,
        {
          $push: { comments: savedComment._id },
        },
        {
          new: true,
        }
      )
        .populate("comments", "_id postedBy")
        .then((result) => {
          //console.log(result);
          return res.json({ result });
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => console.log(err));
});

router.get("/:postId", checkLogin, (req, res) => {
  Post.findById(req.params.postId)
    .populate({
      path: "comments",
      populate: {
        path: "postedBy",
        select: "name",
      },
    })
    .then((post) => {
      return res.status(200).json({ post });
    })
    .catch((err) => console.log(err));
});

router.delete("/:postId", checkLogin, (req, res, next) => {
  Post.findById(req.params.postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      //console.log(post);
      return Comment.deleteMany({ _id: { $in: post.comments } }).then(
        (comments) => {
          return post.deleteOne({ _id: post._id }).then((deletedPost) => {
            res.json({
              post: deletedPost,
              comments,
            });
          });
        }
      );
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
