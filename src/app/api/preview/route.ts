import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Simulate fetching metadata - Replace with actual API calls
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if it's a playlist URL
    const isPlaylist = url.includes("list=") || url.includes("playlist");

    if (isPlaylist) {
      // Mock playlist data
      return NextResponse.json({
        type: "playlist",
        title: "Sample YouTube Playlist",
        thumbnail:
          "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        author: "Channel Name",
        platform: "youtube",
        totalItems: 5,
        items: [
          {
            id: "1",
            title: "Video 1 - Introduction to the Series",
            thumbnail:
              "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            duration: "5:32",
            url: "https://youtube.com/watch?v=1",
            selected: false,
          },
          {
            id: "2",
            title: "Video 2 - Getting Started",
            thumbnail:
              "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            duration: "8:15",
            url: "https://youtube.com/watch?v=2",
            selected: false,
          },
          {
            id: "3",
            title: "Video 3 - Advanced Topics",
            thumbnail:
              "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            duration: "12:45",
            url: "https://youtube.com/watch?v=3",
            selected: false,
          },
          {
            id: "4",
            title: "Video 4 - Best Practices",
            thumbnail:
              "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            duration: "10:20",
            url: "https://youtube.com/watch?v=4",
            selected: false,
          },
          {
            id: "5",
            title: "Video 5 - Conclusion and Next Steps",
            thumbnail:
              "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            duration: "6:55",
            url: "https://youtube.com/watch?v=5",
            selected: false,
          },
        ],
      });
    }

    // Mock single video data
    return NextResponse.json({
      type: type || "video",
      title: "Sample YouTube Video Title",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      duration: "3:45",
      author: "Channel Name",
      description: "This is a sample video description",
      platform: "youtube",
    });
  } catch (error) {
    console.error("Error fetching preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
