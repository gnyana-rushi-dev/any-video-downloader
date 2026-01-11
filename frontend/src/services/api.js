const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed";
    throw new Error(message);
  }
  return data;
};

export const getVideoInfo = async (url, method = "GET") => {
  if (!url) throw new Error("Video URL is required");
  if (method === "POST") {
    const res = await fetch(`${API_BASE}/video/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return handleResponse(res);
  }
  const res = await fetch(
    `${API_BASE}/video/info?url=${encodeURIComponent(url)}`
  );
  return handleResponse(res);
};

export const getPlaylistInfo = async (url, method = "GET") => {
  if (!url) throw new Error("Playlist URL is required");
  if (method === "POST") {
    const res = await fetch(`${API_BASE}/playlist/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return handleResponse(res);
  }
  const res = await fetch(
    `${API_BASE}/playlist/info?url=${encodeURIComponent(url)}`
  );
  return handleResponse(res);
};

export const downloadVideo = async (url, quality = "best") => {
  const res = await fetch(`${API_BASE}/video/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, quality }),
  });
  return handleResponse(res);
};

export const downloadPlaylist = async (url, quality = "best") => {
  const res = await fetch(`${API_BASE}/playlist/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, quality }),
  });
  return handleResponse(res);
};

export const downloadSelectedPlaylist = async (
  url,
  videoIds,
  quality = "best"
) => {
  const res = await fetch(`${API_BASE}/playlist/download-selected`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, videoIds, quality }),
  });
  return handleResponse(res);
};

export const getDownloads = async () => {
  const res = await fetch(`${API_BASE}/downloads`);
  return handleResponse(res);
};

export const getDownloadStatus = async (id) => {
  const res = await fetch(`${API_BASE}/download/status/${id}`);
  return handleResponse(res);
};

export const cancelDownload = async (id) => {
  const res = await fetch(`${API_BASE}/download/cancel/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const api = {
  getVideoInfo,
  getPlaylistInfo,
  downloadVideo,
  downloadPlaylist,
  downloadSelectedPlaylist,
  getDownloads,
  getDownloadStatus,
  cancelDownload,
};

export default api;
