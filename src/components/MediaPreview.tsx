"use client";

import { MediaMetadata, PlaylistItem, PlaylistMetadata } from "@/types/media";
import gsap from "gsap";
import { useEffect, useRef } from "react";

interface MediaPreviewProps {
  metadata?: MediaMetadata | PlaylistMetadata;
  loading: boolean;
  error?: string;
  onPlaylistItemToggle?: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export default function MediaPreview({
  metadata,
  loading,
  error,
  onPlaylistItemToggle,
  onSelectAll,
  onDeselectAll,
}: MediaPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

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

  if (!loading && !metadata && !error) return null;

  return (
    <div ref={previewRef} className="mt-6 overflow-hidden">
      {loading && (
        <div
          className="rounded-lg p-6 text-center"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--tab-bg)",
          }}>
          <div className="flex items-center justify-center gap-3">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--tab-indicator)" }}
            />
            <span style={{ color: "var(--card-text)" }}>
              Loading preview...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}>
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {metadata && !loading && (
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
            />
          ) : (
            <SingleMediaPreview media={metadata} />
          )}
        </div>
      )}
    </div>
  );
}

function SingleMediaPreview({ media }: { media: MediaMetadata }) {
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
      </div>
    </div>
  );
}

function PlaylistPreview({
  playlist,
  onItemToggle,
  onSelectAll,
  onDeselectAll,
}: {
  playlist: PlaylistMetadata;
  onItemToggle?: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}) {
  const selectedCount = playlist.items.filter((item) => item.selected).length;
  const allSelected = selectedCount === playlist.items.length;
  const noneSelected = selectedCount === 0;

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
        </div>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {playlist.items.map((item) => (
          <PlaylistItemRow key={item.id} item={item} onToggle={onItemToggle} />
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
    e.stopPropagation();
    onToggle?.(item.id);
  };

  return (
    <label
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
