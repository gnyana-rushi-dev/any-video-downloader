const express = require("express");
const cors = require("cors");
const downloadRoutes = require("./routes/youtube_routes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", downloadRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "YouTube Video Playlist Downloader API is running" });
});

app.listen(
  5000,
  console.log("backend server is running at http://localhost:5000/")
);
