"use client";

import MediaPreview from "@/components/MediaPreview";
import { useMediaPreview } from "@/lib/hooks/useMediaPreview";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export default function YouTubePage() {
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [downloadType, setDownloadType] = useState<"single" | "playlist">(
    "single",
  );
  const [inputValue, setInputValue] = useState("");

  const {
    metadata,
    loading,
    error,
    fetchPreview,
    togglePlaylistItem,
    selectAllItems,
    deselectAllItems,
  } = useMediaPreview();

  const indicatorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Animate tab indicator
  useEffect(() => {
    if (!indicatorRef.current) return;

    gsap.to(indicatorRef.current, {
      x: activeTab === "video" ? 0 : "100%",
      duration: 0.5,
      ease: "power4.out",
    });
  }, [activeTab]);

  // Animate content change
  useEffect(() => {
    if (!contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
    );
  }, [activeTab]);

  // Auto-fetch preview when URL is pasted
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputValue) return;

    debounceTimerRef.current = setTimeout(() => {
      fetchPreview(inputValue, "youtube", activeTab);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, activeTab, fetchPreview]);

  return (
    <main className="page-gradient min-h-screen px-4 pt-24">
      {/* Title */}
      <h1
        className="mb-10 text-center text-3xl font-bold"
        style={{ color: "var(--card-text)" }}>
        YouTube Downloader
      </h1>

      {/* Tabs */}
      <div
        className="relative mx-auto flex w-full max-w-md rounded-xl p-1"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--tab-bg)",
        }}>
        {/* Sliding Indicator */}
        <div
          ref={indicatorRef}
          className="absolute left-0 top-0 h-full w-1/2 rounded-lg transition-all"
          style={{ backgroundColor: "var(--tab-indicator)" }}
        />

        <button
          onClick={() => setActiveTab("video")}
          className={`relative z-10 flex-1 rounded-lg py-3 font-semibold transition`}
          style={{
            color:
              activeTab === "video"
                ? "var(--page-bg-gradient-to)"
                : "var(--card-text)",
          }}>
          Video
        </button>

        <button
          onClick={() => setActiveTab("audio")}
          className={`relative z-10 flex-1 rounded-lg py-3 font-semibold transition`}
          style={{
            color:
              activeTab === "audio"
                ? "var(--page-bg-gradient-to)"
                : "var(--card-text)",
          }}>
          Audio
        </button>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="card-bg mx-auto mt-12 max-w-xl rounded-2xl p-8 shadow-xl">
        {activeTab === "video" ? (
          <div>
            <h2
              className="mb-4 text-xl font-semibold"
              style={{ color: "var(--card-text)" }}>
              Download YouTube Video
            </h2>
            <p className="card-muted mb-6">
              Paste a YouTube video URL and download it in your preferred
              quality.
            </p>

            {/* Download Type Selection */}
            <div className="mb-6 flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downloadType"
                  value="single"
                  checked={downloadType === "single"}
                  onChange={() => setDownloadType("single")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span style={{ color: "var(--card-text)" }}>Single Video</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downloadType"
                  value="playlist"
                  checked={downloadType === "playlist"}
                  onChange={() => setDownloadType("playlist")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span style={{ color: "var(--card-text)" }}>Playlist</span>
              </label>
            </div>

            <div className="space-y-4">
              <input
                type="url"
                placeholder={
                  downloadType === "single"
                    ? "Paste YouTube video URL here..."
                    : "Paste YouTube playlist URL here..."
                }
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: "var(--page-bg-gradient-from)",
                  color: "var(--card-text)",
                  borderColor: "var(--tab-bg)",
                }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <MediaPreview
                metadata={metadata}
                loading={loading}
                error={error}
                onPlaylistItemToggle={togglePlaylistItem}
                onSelectAll={selectAllItems}
                onDeselectAll={deselectAllItems}
              />
            </div>
          </div>
        ) : (
          <div>
            <h2
              className="mb-4 text-xl font-semibold"
              style={{ color: "var(--card-text)" }}>
              Download YouTube Audio
            </h2>
            <p className="card-muted mb-6">
              Extract high-quality audio from YouTube videos instantly.
            </p>

            {/* Download Type Selection */}
            <div className="mb-6 flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downloadType"
                  value="single"
                  checked={downloadType === "single"}
                  onChange={() => setDownloadType("single")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span style={{ color: "var(--card-text)" }}>Single Audio</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downloadType"
                  value="playlist"
                  checked={downloadType === "playlist"}
                  onChange={() => setDownloadType("playlist")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span style={{ color: "var(--card-text)" }}>Playlist</span>
              </label>
            </div>

            <div className="space-y-4">
              <input
                type="url"
                placeholder={
                  downloadType === "single"
                    ? "Paste YouTube video URL here..."
                    : "Paste YouTube playlist URL here..."
                }
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: "var(--page-bg-gradient-from)",
                  color: "var(--card-text)",
                  borderColor: "var(--tab-bg)",
                }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <MediaPreview
                metadata={metadata}
                loading={loading}
                error={error}
                onPlaylistItemToggle={togglePlaylistItem}
                onSelectAll={selectAllItems}
                onDeselectAll={deselectAllItems}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
