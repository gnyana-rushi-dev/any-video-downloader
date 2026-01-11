import { create } from "zustand";
import api from "../services/api";

export const useDownloaderStore = create((set, get) => ({
  videoUrl: "",
  playlistUrl: "",
  videoMethod: "GET",
  playlistMethod: "GET",
  quality: "best",
  videoInfo: null,
  playlistInfo: null,
  selectedVideoIds: new Set(),
  downloads: [],
  loading: {
    videoInfo: false,
    playlistInfo: false,
    download: false,
    downloads: false,
  },
  error: null,

  setField: (key, value) => set({ [key]: value }),

  toggleVideoSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedVideoIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedVideoIds: next };
    }),

  clearSelections: () => set({ selectedVideoIds: new Set() }),
  setSelections: (ids) => set({ selectedVideoIds: new Set(ids) }),

  fetchVideoInfo: async () => {
    const { videoUrl, videoMethod } = get();
    set((state) => ({
      loading: { ...state.loading, videoInfo: true },
      error: null,
    }));
    try {
      const data = await api.getVideoInfo(videoUrl, videoMethod);
      set({
        videoInfo: data.data,
        loading: { ...get().loading, videoInfo: false },
      });
    } catch (error) {
      set({
        error: error.message,
        loading: { ...get().loading, videoInfo: false },
      });
    }
  },

  fetchPlaylistInfo: async () => {
    const { playlistUrl, playlistMethod } = get();
    set((state) => ({
      loading: { ...state.loading, playlistInfo: true },
      error: null,
    }));
    try {
      const data = await api.getPlaylistInfo(playlistUrl, playlistMethod);
      set({
        playlistInfo: data.data,
        selectedVideoIds: new Set(),
        loading: { ...get().loading, playlistInfo: false },
      });
    } catch (error) {
      set({
        error: error.message,
        loading: { ...get().loading, playlistInfo: false },
      });
    }
  },

  downloadVideo: async () => {
    const { videoUrl, quality } = get();
    set((state) => ({
      loading: { ...state.loading, download: true },
      error: null,
    }));
    try {
      const data = await api.downloadVideo(videoUrl, quality);
      set({
        downloads: [data.data, ...get().downloads],
        loading: { ...get().loading, download: false },
      });
    } catch (error) {
      set({
        error: error.message,
        loading: { ...get().loading, download: false },
      });
    }
  },

  downloadPlaylist: async () => {
    const { playlistUrl, quality } = get();
    set((state) => ({
      loading: { ...state.loading, download: true },
      error: null,
    }));
    try {
      const data = await api.downloadPlaylist(playlistUrl, quality);
      set({
        downloads: [data.data, ...get().downloads],
        loading: { ...get().loading, download: false },
      });
    } catch (error) {
      set({
        error: error.message,
        loading: { ...get().loading, download: false },
      });
    }
  },

  downloadSelectedPlaylist: async () => {
    const { playlistUrl, quality, selectedVideoIds } = get();
    set((state) => ({
      loading: { ...state.loading, download: true },
      error: null,
    }));
    try {
      const data = await api.downloadSelectedPlaylist(
        playlistUrl,
        Array.from(selectedVideoIds),
        quality
      );
      set({
        downloads: [data.data, ...get().downloads],
        loading: { ...get().loading, download: false },
      });
    } catch (error) {
      set({
        error: error.message,
        loading: { ...get().loading, download: false },
      });
    }
  },

  refreshDownloads: async () => {
    set((state) => ({
      loading: { ...state.loading, downloads: true },
      error: null,
    }));
    try {
      const data = await api.getDownloads();
      set({
        downloads: data.data || [],
        loading: { ...get().loading, downloads: false },
      });
    } catch (error) {
      set({
        error: error.message,
        loading: { ...get().loading, downloads: false },
      });
    }
  },

  cancelDownload: async (id) => {
    set({ error: null });
    try {
      await api.cancelDownload(id);
      await get().refreshDownloads();
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

export default useDownloaderStore;
