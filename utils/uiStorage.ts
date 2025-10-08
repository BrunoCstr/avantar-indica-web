// Utilitário para gerenciar configurações de UI no localStorage

const STORAGE_KEYS = {
  THEME: "avantar-theme",
  SIDEBAR: "avantar-sidebar",
} as const;

export const uiStorage = {
  // Tema
  getTheme: (): "light" | "dark" | "system" => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return (stored as "light" | "dark" | "system") || "light";
  },

  setTheme: (theme: "light" | "dark" | "system") => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Sidebar
  getSidebarCollapsed: (): boolean => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
    return stored === "true";
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.SIDEBAR, collapsed.toString());
  },

  // Limpar todas as configurações
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.SIDEBAR);
  },
}; 