"use client";

import { useUISettings } from "@/hooks/useUISettings";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Header } from "@/components/header";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  userType?: "cliente_indicador" | "parceiro_indicador";
}

/**
 * Container responsivo que se ajusta automaticamente ao estado da sidebar
 * - Mobile: sem margem
 * - Desktop com sidebar expandida: ml-[280px]
 * - Desktop com sidebar colapsada: ml-[80px]
 */
export function PageContainer({ 
  children, 
  className,
  showHeader = true,
  userType = "parceiro_indicador"
}: PageContainerProps) {
  const { sidebarCollapsed } = useUISettings();

  return (
    <div
      className={cn(
        "min-h-screen relative pb-24 lg:pb-0 transition-all duration-300",
        sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]",
        className
      )}
    >
      {/* Header - Apenas Desktop */}
      {showHeader && (
        <div className="hidden lg:block">
          <Header userType={userType} />
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Background fixo que se ajusta ao estado da sidebar
 */
export function PageBackground({ 
  className 
}: { 
  className?: string 
}) {
  const { sidebarCollapsed } = useUISettings();

  return (
    <div
      className={cn(
        "fixed inset-0 transition-all duration-300",
        "bg-white dark:bg-fifth-purple",
        sidebarCollapsed ? "lg:left-[80px]" : "lg:left-[280px]",
        className
      )}
    />
  );
}

