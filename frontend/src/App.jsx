import { useEffect, useMemo } from "react";
import useDownloaderStore from "./state/useDownloaderStore";

const formatSeconds = (seconds) => {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

function App() {
  const {
    videoUrl,
    playlistUrl,
    videoMethod,
    playlistMethod,
    quality,
    videoInfo,
    playlistInfo,
    selectedVideoIds,
    downloads,
    loading,
    error,
    setField,
    toggleVideoSelection,
    clearSelections,
    setSelections,
    fetchVideoInfo,
    fetchPlaylistInfo,
    downloadVideo,
    downloadPlaylist,
    downloadSelectedPlaylist,
    refreshDownloads,
    cancelDownload,
  } = useDownloaderStore();

  useEffect(() => {
    refreshDownloads();
    const interval = setInterval(refreshDownloads, 8000);
    return () => clearInterval(interval);
  }, [refreshDownloads]);

  const playlistVideos = useMemo(
    () => playlistInfo?.videos || [],
    [playlistInfo]
  );

  const handleSelectAll = () => {
    if (!playlistVideos.length) return;
    const allIds = playlistVideos.map((v) => v.id);
    setSelections(allIds);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-3 rounded-xl bg-slate-900 px-5 py-4 shadow">
          <div className="text-lg font-semibold text-slate-200">
            YouTube Video & Playlist Downloader
          </div>
          <div className="text-sm text-slate-400">
            Use yt-dlp via the backend to fetch info, select playlist videos,
            and download.
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Video info + download */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100">Video</h2>
              <select
                value={videoMethod}
                onChange={(e) => setField("videoMethod", e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="YouTube video URL"
                value={videoUrl}
                onChange={(e) => setField("videoUrl", e.target.value)}
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={fetchVideoInfo}
                disabled={loading.videoInfo}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60">
                {loading.videoInfo ? "Fetching..." : "Get Info"}
              </button>
              <button
                onClick={downloadVideo}
                disabled={loading.download}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">
                {loading.download ? "Starting..." : "Download Video"}
              </button>
              <select
                value={quality}
                onChange={(e) => setField("quality", e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-100">
                {["best", "1080p", "720p", "480p", "360p", "240p"].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            {videoInfo && (
              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                <div className="font-semibold text-slate-100">
                  {videoInfo.title}
                </div>
                <div className="mt-1 text-slate-400">{videoInfo.url}</div>
                <div className="mt-2 flex gap-4 text-slate-300">
                  <span>Duration: {formatSeconds(videoInfo.duration)}</span>
                  <span>Views: {videoInfo.viewCount ?? "-"}</span>
                </div>
              </div>
            )}
          </section>

          {/* Playlist info */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-100">
                Playlist
              </h2>
              <select
                value={playlistMethod}
                onChange={(e) => setField("playlistMethod", e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="YouTube playlist URL"
                value={playlistUrl}
                onChange={(e) => setField("playlistUrl", e.target.value)}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={fetchPlaylistInfo}
                disabled={loading.playlistInfo}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60">
                {loading.playlistInfo ? "Fetching..." : "Get Info"}
              </button>
              <button
                onClick={downloadPlaylist}
                disabled={loading.download}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">
                {loading.download ? "Starting..." : "Download Full"}
              </button>
              <button
                onClick={downloadSelectedPlaylist}
                disabled={loading.download || !selectedVideoIds.size}
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60">
                {loading.download ? "Starting..." : "Download Selected"}
              </button>
              <button
                onClick={handleSelectAll}
                disabled={!playlistVideos.length}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 disabled:opacity-60">
                Select All
              </button>
              <button
                onClick={clearSelections}
                disabled={!selectedVideoIds.size}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 disabled:opacity-60">
                Clear Selection
              </button>
            </div>

            {playlistInfo && (
              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      {playlistInfo.title || "Playlist"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {playlistInfo.videoCount} videos
                    </div>
                  </div>
                </div>

                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {playlistVideos.map((video) => (
                    <label
                      key={video.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedVideoIds.has(video.id)}
                        onChange={() => toggleVideoSelection(video.id)}
                        className="mt-1 h-4 w-4 accent-indigo-500"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-100">
                          {video.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {video.url}
                        </span>
                        <span className="text-xs text-slate-500">
                          Duration: {formatSeconds(video.duration)}
                        </span>
                      </div>
                    </label>
                  ))}
                  {!playlistVideos.length && (
                    <div className="text-center text-xs text-slate-500">
                      No videos loaded yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Downloads */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">
              Downloads
            </h2>
            <button
              onClick={refreshDownloads}
              disabled={loading.downloads}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 disabled:opacity-60">
              {loading.downloads ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="grid gap-3">
            {downloads?.map((item) => (
              <div
                key={item.downloadId}
                className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-100">
                    {item.downloadId}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-slate-800 px-2 py-1 uppercase">
                      {item.type}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-1">
                      {item.status}
                    </span>
                    <span>{item.progress ?? 0}%</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">{item.url}</div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {item.totalVideos !== undefined && (
                    <span>
                      Videos: {item.downloadedVideos ?? 0}/{item.totalVideos} |
                      Failed: {item.failedVideos ?? 0}
                    </span>
                  )}
                  <span>Quality: {item.quality || "best"}</span>
                  {item.error && (
                    <span className="text-rose-400">Error: {item.error}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelDownload(item.downloadId)}
                    className="rounded-lg border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-600/10">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
            {!downloads?.length && (
              <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
                No downloads yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
