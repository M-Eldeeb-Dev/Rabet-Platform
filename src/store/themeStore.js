import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: (() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rabet-theme");
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  })(),

  initTheme: () => {
    const state = useThemeStore.getState();
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("rabet-theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: next };
    }),

  setTheme: (theme) =>
    set(() => {
      localStorage.setItem("rabet-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme };
    }),
}));

export default useThemeStore;
