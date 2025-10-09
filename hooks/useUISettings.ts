"use client";

import { useAuth } from "@/context/Auth";
import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect, useState } from "react";
import { uiStorage } from "@/utils/uiStorage";

export function useUISettings() {
  const { userData, updateUISettings } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(uiStorage.getSidebarCollapsed());

  // Sincroniza com os dados do usuário quando disponíveis
  useEffect(() => {
    if (userData?.uiSettings?.sidebarCollapsed !== undefined) {
      setSidebarCollapsed(userData.uiSettings.sidebarCollapsed);
      uiStorage.setSidebarCollapsed(userData.uiSettings.sidebarCollapsed);
    }
  }, [userData?.uiSettings?.sidebarCollapsed]);

  const updateSidebarCollapsed = useCallback(async (collapsed: boolean) => {
    try {
      setSidebarCollapsed(collapsed);
      uiStorage.setSidebarCollapsed(collapsed);
      await updateUISettings({ sidebarCollapsed: collapsed });
    } catch (error) {
      console.error("Erro ao atualizar sidebar:", error);
    }
  }, [updateUISettings]);

  const updateTheme = useCallback(async (newTheme: "light" | "dark" | "system") => {
    try {
      // Primeiro atualiza o estado local
      setTheme(newTheme);
      // Depois persiste no Firestore
      await updateUISettings({ theme: newTheme });
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
    }
  }, [setTheme, updateUISettings]);

  return {
    sidebarCollapsed: sidebarCollapsed,
    theme: theme, // Usa o tema atual do contexto
    updateSidebarCollapsed,
    updateTheme,
  };
} 