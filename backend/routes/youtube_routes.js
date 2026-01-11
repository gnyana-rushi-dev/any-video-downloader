const express = require("express");
const router = express.Router();

router.post("/video/info", getVideoInfo);

router.post("/video/download", downloadVideo);

router.post("/playlist/info", getPlaylistInfo);

router.post("/playlist/download-selected", downloadSelectedPlaylistVideos);

router.post("/playlist/download", downloadPlaylist);

router.get("/downloads", getAllDownloads);

module.exports = router;