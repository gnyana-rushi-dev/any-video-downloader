"use client";

import { MediaMetadata, PlaylistItem, PlaylistMetadata } from "@/types/media";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

interface MediaPreviewProps {
  metadata?: MediaMetadata | PlaylistMetadata;
  loading: boolean;
  error?: string;
  onPlaylistItemToggle?: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  zipKind?: "video" | "audio";
}

export default function MediaPreview({
  metadata,
  loading,
  error,
  onPlaylistItemToggle,
  onSelectAll,
  onDeselectAll,
  zipKind,
}: MediaPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "error" | "info" | "success"
  >("info");

  useEffect(() => {
    if (!previewRef.current) return;

    if (metadata || error) {
      gsap.fromTo(
        previewRef.current,
        { y: 20, opacity: 0, height: 0 },
        { y: 0, opacity: 1, height: "auto", duration: 0.5, ease: "power3.out" },
      );
    }
  }, [metadata, error]);

  useEffect(() => {
    const message = error ?? downloadError;
    if (message) {
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [error, downloadError]);

  const handleSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  if (!loading && !metadata && !error) return null;

  return (
    <div ref={previewRef} className="mt-6 overflow-hidden">
      {loading && (
        <Box
          className="rounded-lg p-6"
          sx={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--tab-bg)",
          }}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: "var(--card-text)", mb: 2 }}>
            Loading preview...
          </Typography>
          <LinearProgress sx={{ height: 10, borderRadius: 5 }} />
        </Box>
      )}

      {downloading && (
        <Box
          className="rounded-lg p-6"
          sx={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--tab-bg)",
          }}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: "var(--card-text)", mb: 2 }}>
            Downloading... {downloadProgress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={downloadProgress}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      )}

      {(error || downloadError) && (
        <Alert
          severity="error"
          sx={{
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            color: "var(--card-text)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}>
          {error ?? downloadError}
        </Alert>
      )}

      {metadata && !loading && !downloading && (
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--tab-bg)",
          }}>
          {metadata.type === "playlist" ? (
            <PlaylistPreview
              playlist={metadata as PlaylistMetadata}
              onItemToggle={onPlaylistItemToggle}
              onSelectAll={onSelectAll}
              onDeselectAll={onDeselectAll}
              zipKind={zipKind}
              onDownloading={setDownloading}
              onProgress={setDownloadProgress}
              onError={setDownloadError}
            />
          ) : (
            <SingleMediaPreview
              media={metadata}
              onDownloadError={setDownloadError}
              onDownloading={setDownloading}
              onProgress={setDownloadProgress}
            />
          )}
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

async function downloadSingle(
  media: MediaMetadata,
  setDownloading: (v: boolean) => void,
  setError: (m?: string) => void,
  setProgress: (p: number) => void,
  formatId?: string,
  formatExt?: string,
) {
  if (media.type === "photo" && media.sourceUrl) {
    try {
      setError(undefined);
      setDownloading(true);
      setProgress(0);
      const res = await fetch(media.sourceUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${media.title || "image"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setProgress(100);
      setTimeout(() => {
        setDownloading(false);
        setProgress(0);
      }, 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDownloading(false);
      setProgress(0);
    }
    return;
  }

  try {
    setError(undefined);
    setDownloading(true);
    setProgress(0);
    const kind = media.type === "audio" ? "audio" : "video";
    const formatQuery = formatId
      ? `&formatId=${encodeURIComponent(formatId)}`
      : "";
    const resolvedExt = kind === "audio" ? (formatExt ?? "mp3") : "mp4";

    // Use fetch to track progress
    const downloadUrl = `/api/download?url=${encodeURIComponent(media.sourceUrl!)}&kind=${kind}${formatQuery}`;
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      const fallback = response.statusText || response.status.toString();
      throw new Error(bodyText || `Download failed: ${fallback}`);
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (total > 0) {
        const progress = Math.round((receivedLength / total) * 100);
        setProgress(progress);
      }
    }

    // Combine chunks into single blob
    const blob = new Blob(chunks as BlobPart[]);
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${media.title}.${resolvedExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setProgress(100);
    setTimeout(() => {
      setDownloading(false);
      setProgress(0);
    }, 500);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    setError(
      message.startsWith("Download failed")
        ? message
        : `Network error: ${message}`,
    );
    setDownloading(false);
    setProgress(0);
  }
}

function SingleMediaPreview({
  media,
  onDownloadError,
  onDownloading,
  onProgress,
}: {
  media: MediaMetadata;
  onDownloadError: (m?: string) => void;
  onDownloading: (v: boolean) => void;
  onProgress: (p: number) => void;
}) {
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>();

  useEffect(() => {
    if (media.type === "audio" && media.audioFormats?.length) {
      setSelectedAudioFormat(media.audioFormats[0].formatId);
    } else {
      setSelectedAudioFormat(undefined);
    }
  }, [media]);

  const preferredAudioFormat =
    media.type === "audio"
      ? (media.audioFormats?.find((f) => f.formatId === selectedAudioFormat) ??
        media.audioFormats?.[0])
      : undefined;

  const audioFormatValue =
    media.type === "audio" ? (preferredAudioFormat?.formatId ?? "") : "";

  return (
    <div className="flex gap-4">
      {media.thumbnail && (
        <div className="flex-shrink-0">
          <img
            src={media.thumbnail}
            alt={media.title}
            className="h-24 w-40 rounded-lg object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <h3
          className="mb-2 text-lg font-semibold"
          style={{ color: "var(--card-text)" }}>
          {media.title}
        </h3>
        <div
          className="space-y-1 text-sm"
          style={{ color: "var(--card-text)", opacity: 0.7 }}>
          {media.author && <p>By {media.author}</p>}
          {media.duration && <p>Duration: {media.duration}</p>}
          {media.type && (
            <p className="capitalize">
              Type: {media.type === "photo" ? "Image" : media.type}
            </p>
          )}
        </div>
        {media.type === "audio" && media.audioFormats?.length ? (
          <Box mt={2} maxWidth={340}>
            <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
              <InputLabel id={`audio-quality-${media.title}`}>
                Audio quality
              </InputLabel>
              <Select
                labelId={`audio-quality-${media.title}`}
                label="Audio quality"
                value={audioFormatValue}
                onChange={(e) => setSelectedAudioFormat(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "var(--card-bg)",
                      color: "var(--card-text)",
                    },
                  },
                }}
                sx={{
                  backgroundColor: "var(--page-bg-gradient-from)",
                  color: "var(--card-text)",
                  borderColor: "var(--tab-bg)",
                }}>
                {media.audioFormats.map((fmt) => (
                  <MenuItem key={fmt.formatId} value={fmt.formatId}>
                    {fmt.label ?? fmt.formatId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : null}

        {(media.type === "video" ||
          media.type === "audio" ||
          media.type === "photo") &&
          media.sourceUrl && (
            <div className="mt-4">
              <Button
                type="button"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  downloadSingle(
                    media,
                    onDownloading,
                    onDownloadError,
                    onProgress,
                    preferredAudioFormat?.formatId,
                    preferredAudioFormat?.ext,
                  );
                }}
                sx={{
                  backgroundColor: "var(--tab-indicator)",
                  color: "var(--page-bg-gradient-to)",
                  "&:hover": {
                    opacity: 0.9,
                    backgroundColor: "var(--tab-indicator)",
                  },
                }}>
                Download{" "}
                {media.type === "audio"
                  ? preferredAudioFormat?.label
                    ? `Audio (${preferredAudioFormat.label})`
                    : "Audio"
                  : media.type === "photo"
                    ? "Image"
                    : "Video"}
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}

function PlaylistPreview({
  playlist,
  onItemToggle,
  onSelectAll,
  onDeselectAll,
  zipKind,
  onDownloading,
  onProgress,
  onError,
}: {
  playlist: PlaylistMetadata;
  onItemToggle?: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  zipKind?: "video" | "audio";
  onDownloading?: (v: boolean) => void;
  onProgress?: (p: number) => void;
  onError?: (m?: string) => void;
}) {
  const selectedCount = playlist.items.filter((item) => item.selected).length;
  const allSelected = selectedCount === playlist.items.length;
  const noneSelected = selectedCount === 0;

  async function downloadSelected(
    items: PlaylistItem[],
    setError: (m?: string) => void,
    setDownloading: (v: boolean) => void,
  ) {
    try {
      setError(undefined);
      setDownloading(true);
      const selected = items.filter((i) => i.selected && i.url);
      if (selected.length === 0) throw new Error("No items selected");

      // Download each selected item using the download endpoint
      selected.forEach((item, index) => {
        setTimeout(() => {
          const downloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&kind=video`;
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `${item.title}.mp4`;
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, index * 500); // Stagger downloads by 500ms
      });

      setTimeout(() => setDownloading(false), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--card-text)" }}>
            {playlist.title}
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--card-text)", opacity: 0.7 }}>
            {playlist.totalItems} items • {selectedCount} selected
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectAll?.();
            }}
            disabled={allSelected}
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--tab-indicator)",
              color: "var(--page-bg-gradient-to)",
            }}>
            Select All
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeselectAll?.();
            }}
            disabled={noneSelected}
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--tab-bg)",
              color: "var(--card-text)",
            }}>
            Deselect All
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Fallback: individual downloads via browser
              onDownloading?.(true);
              downloadSelected(
                playlist.items,
                (m) => onError?.(m),
                (v) => onDownloading?.(v),
              );
            }}
            disabled={noneSelected}
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--tab-indicator)",
              color: "var(--page-bg-gradient-to)",
            }}>
            Download Selected
          </button>
          {selectedCount > 1 && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  // Start loader
                  onError?.(undefined);
                  onDownloading?.(true);
                  // Gather selected URLs
                  const urls = playlist.items
                    .filter((i) => i.selected && i.url)
                    .map((i) => i.url!);
                  if (urls.length < 2) return;
                  // Trigger ZIP download with progress
                  const res = await fetch("/api/download-zip", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ urls, kind: zipKind ?? "video" }),
                  });
                  if (!res.ok)
                    throw new Error(`ZIP request failed: ${res.statusText}`);
                  const totalHeader = res.headers.get("X-Total-Size");
                  const total = totalHeader ? parseInt(totalHeader, 10) : 0;
                  const reader = res.body?.getReader();
                  if (!reader) throw new Error("ZIP stream not readable");
                  const chunks: Uint8Array[] = [];
                  let received = 0;
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    if (total > 0) {
                      const pct = Math.round((received / total) * 100);
                      onProgress?.(pct);
                    }
                  }
                  const blob = new Blob(chunks as BlobPart[], {
                    type: "application/zip",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "playlist.zip";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  onProgress?.(100);
                  setTimeout(() => {
                    onDownloading?.(false);
                    onProgress?.(0);
                  }, 500);
                } catch (err) {
                  onError?.(err instanceof Error ? err.message : String(err));
                  onDownloading?.(false);
                }
              }}
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: "var(--tab-indicator)",
                color: "var(--page-bg-gradient-to)",
              }}>
              Download as ZIP
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {playlist.items.map((item, idx) => (
          <PlaylistItemRow
            key={`${item.id}-${idx}`}
            item={item}
            onToggle={onItemToggle}
          />
        ))}
      </div>
    </div>
  );
}

function PlaylistItemRow({
  item,
  onToggle,
}: {
  item: PlaylistItem;
  onToggle?: (id: string) => void;
}) {
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.(item.id);
  };

  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.(item.id);
  };

  return (
    <label
      onClick={handleLabelClick}
      className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-opacity-50"
      style={{
        backgroundColor: item.selected
          ? "var(--tab-bg)"
          : "var(--page-bg-gradient-from)",
      }}>
      <input
        type="checkbox"
        checked={item.selected}
        onChange={handleToggle}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 cursor-pointer rounded"
      />
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-12 w-20 flex-shrink-0 rounded object-cover"
        />
      )}
      <div className="flex-1 overflow-hidden">
        <p
          className="truncate text-sm font-medium"
          style={{ color: "var(--card-text)" }}>
          {item.title}
        </p>
        {item.duration && (
          <p
            className="text-xs"
            style={{ color: "var(--card-text)", opacity: 0.6 }}>
            {item.duration}
          </p>
        )}
      </div>
    </label>
  );
}
