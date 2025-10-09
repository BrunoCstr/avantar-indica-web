"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/context/Auth"
import { uiStorage } from "@/utils/uiStorage"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  attribute = "data-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const { userData, userAuthenticated, isLoading } = useAuth();
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Limpa o localStorage apenas se não há usuário autenticado E não está carregando
    if (!userAuthenticated && !isLoading) {
      uiStorage.clear();
    }
  }, [userAuthenticated, isLoading])

  // Carrega o tema salvo do usuário quando disponível
  useEffect(() => {
    if (isLoading) {
      // Se está carregando, verifica se há tema no localStorage para evitar flash
      const storedTheme = uiStorage.getTheme();
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } else if (!userAuthenticated && !isLoading) {
      // Se não há usuário autenticado E não está carregando, verifica se há tema no localStorage
      const storedTheme = uiStorage.getTheme();
      if (storedTheme && storedTheme !== "light") {
        setTheme(storedTheme);
      } else {
        setTheme(defaultTheme);
        uiStorage.clear();
      }
    } else if (userData?.uiSettings?.theme) {
      // Se o usuário tem tema salvo, usa ele
      setTheme(userData.uiSettings.theme);
      uiStorage.setTheme(userData.uiSettings.theme);
    } else if (userData && !userData.uiSettings?.theme) {
      // Se o usuário está autenticado mas não tem tema salvo, usa o tema padrão
      setTheme(defaultTheme);
      uiStorage.setTheme(defaultTheme);
    } else if (userAuthenticated && !userData) {
      // Se está autenticado mas ainda não carregou os dados do usuário, verifica localStorage
      const storedTheme = uiStorage.getTheme();
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(defaultTheme);
      }
    }
  }, [userData?.uiSettings?.theme, userData, userAuthenticated, isLoading, defaultTheme]);

  useEffect(() => {
    const root = window.document.documentElement

    if (disableTransitionOnChange) {
      root.classList.add("no-transitions")
    }

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
      root.setAttribute("class", root.className)
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      root.setAttribute("class", root.className)
    }

    if (disableTransitionOnChange) {
      setTimeout(() => {
        root.classList.remove("no-transitions")
      }, 0)
    }
  }, [theme, attribute, disableTransitionOnChange, enableSystem])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
      uiStorage.setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {mounted && children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
