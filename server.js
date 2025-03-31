const express = require("express");
const axios = require("axios");
const { getPostById, getNumberOfRows } = require("./readFile");
const mongoose = require('mongoose');
const StaticData = require('./messageIndexSchema')

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const PAGE_ID_1 = process.env.PAGE_ID_1; // Masterclass
const PAGE_ID_2 = process.env.PAGE_ID_2; // DIY
const ACCESS_TOKEN_1 = process.env.ACCESS_TOKEN_1;
const ACCESS_TOKEN_2 = process.env.ACCESS_TOKEN_2;
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((data) => {
  console.log(`mongodb connected to ${data.connection.host}`)
})


const postToFacebook = async (message, imageUrl = null) => {
  // console.log("inn api", message, imageUrl)
  try {
    const url = imageUrl
      ? `https://graph.facebook.com/v22.0/${PAGE_ID_1}/photos`
      : `https://graph.facebook.com/v22.0/${PAGE_ID_1}/feed`;

    const payload = imageUrl
      ? { url: imageUrl, caption: message, access_token: ACCESS_TOKEN_1 }
      : { message: message, access_token: ACCESS_TOKEN_1 };

      // console.log("before req", payload)
    const response = await axios.post(url, payload);
    console.log("Post created successfully:");
  } catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
  }
};

// API Route for scheduled Facebook posts
app.get("/api/post-to-facebook", async (req, res) => {

  const resp = await StaticData.find({name: "currIndex"})
  // let lastMessageIndex = StaticData

  let messageIndex = resp[0].messageIndex + 1;

  const filePath = "Facebook Ads.xlsx";
  
  let postId = messageIndex % getNumberOfRows(filePath)
  const post = getPostById(filePath, postId);

  // console.log(post)
  
  // if (messageIndex !== -1) {

    postToFacebook(post.message, post.imageUrl);

    const updatedDocument = await StaticData.findOneAndUpdate(
      { name: "currIndex" }, 
      { $set: { messageIndex: messageIndex } }, 
      { new: true } 
    );

    // console.log(postId, 'after api')

    res.json({ success: true, message: "Post scheduled successfully" });
  // }
  //  else {
  //   res.json({ success: false, message: "No post scheduled at this time" });
  // }
});

const getLatestYouTubeVideo = async () => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${GOOGLE_CLOUD_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=100`
    );

    if (response.data.items.length > 0) {
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      const video = response.data.items[randomNumber];
      console.log("vedio", video)
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.high.url,
      };
    }
  } catch (error) {
    console.error("Error fetching YouTube video:", error.response?.data || error.message);
  }
  return null;
};

const postLink = async (message, link) => {
  try {
    const url = `https://graph.facebook.com/v18.0/${PAGE_ID_2}/feed`;
    const payload = { message: message, link: link, access_token: ACCESS_TOKEN_2 };

    console.log("before req")

    const response = await axios.post(url, payload);

    console.log("after req")
    console.log("Post created successfully:", response.data);
  } catch (error) {
    console.error("Error posting to Facebook:", error.response?.data || error.message);
  }
};

// API Route for scheduled YouTube posts
app.get("/api/post-youtube-video", async (req, res) => {
  for (let i=0; i<15; i++){
  let latestVideo = await getLatestYouTubeVideo();
  if (latestVideo) {
    const message = `🎥 New Video Alert: ${latestVideo.title}\n\nWatch now: ${latestVideo.url}`;
    console.log("before api")
    postLink(message, latestVideo.url);
    console.log("after api")
    break;
    res.json({ success: true, message: "YouTube post scheduled successfully" });
  } 
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Required for Vercel's API routes
