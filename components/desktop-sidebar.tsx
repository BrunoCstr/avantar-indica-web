"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/Auth";
import { Wallet, ClipboardList, Bell, User } from "lucide-react";

interface SidebarProps {
  userType: "parceiro_indicador" | "cliente_indicador";
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({
  userType,
  isCollapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const parceiro_indicador_routes = [
    { href: "indicador/dashboard", icon: Home, title: "Dashboard" },
    { href: "indicador/carteira", icon: Wallet, title: "Carteira" },
    { href: "indicador/status", icon: ClipboardList, title: "Status" },
    { href: "indicador/vendedores", icon: Users, title: "Vendedores" },
    { href: "indicador/notificacoes", icon: Bell, title: "Notificações" },
    { href: "indicador/configuracoes", icon: Settings, title: "Configurações" },
    { href: "indicador/perfil", icon: User, title: "Perfil" },
  ];

  const cliente_indicador_routes = [
    { href: "indicador/dashboard", icon: Home, title: "Dashboard" },
    { href: "indicador/carteira", icon: Wallet, title: "Carteira" },
    { href: "indicador/status", icon: ClipboardList, title: "Status" },
    { href: "indicador/notificacoes", icon: Bell, title: "Notificações" },
    { href: "indicador/configuracoes", icon: Settings, title: "Configurações" },
    { href: "indicador/perfil", icon: User, title: "Perfil" },
  ];

  const routes = userType === "parceiro_indicador" ? parceiro_indicador_routes : cliente_indicador_routes;


  if (!isMounted) {
    return null;
  }

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 rounded-full shadow-md border-0 bg-white/90 backdrop-blur-sm dark:bg-avantar-dark/90"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-0 shadow-2xl">
          <div className="h-full flex flex-col bg-gradient-to-b from-avantar-primary to-avantar-secondary text-white">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/logo-sidebar.svg"
                    alt="Avantar Logo"
                    width={42}
                    height={42}
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-xl text-white">
                  Avantar Indica
                </span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-6 px-3 scrollbar-hide">
              <nav className="grid gap-1">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant="ghost"
                    className={cn(
                      "flex justify-start items-center gap-3 rounded-xl px-3 py-6 text-sm font-medium transition-all",
                      pathname === route.href
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => handleNavigation(route.href)}
                  >
                    <route.icon className="h-5 w-5" />
                    <span>{route.title}</span>
                    {pathname === route.href && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-white" />
                    )}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => {
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed hidden md:flex h-full flex-col bg-gradient-to-b from-avantar-primary to-avantar-secondary text-white border-r border-white/10 shadow-sm transition-all duration-300 z-40 overflow-hidden",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        <div className={cn(
          "p-4 flex items-center border-b border-white/10 overflow-hidden",
          isCollapsed ? "justify-center relative" : "justify-between"
        )}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/" className={cn(
                  "flex items-center min-w-0",
                  isCollapsed ? "justify-center" : "gap-2"
                )}>
                  <div className="flex items-center justify-center">
                    <Image
                      src="/images/logo-sidebar.svg"
                      alt="Avantar Logo"
                      width={isCollapsed ? 32 : 42}
                      height={isCollapsed ? 32 : 42}
                      className="object-contain"
                    />
                  </div>
                  <div className={cn(
                    "transition-all duration-300 ease-in-out max-w-[200px]",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    <span className="font-bold pl-2 text-xl text-white whitespace-nowrap block overflow-hidden text-ellipsis">
                      Avantar Indica
                    </span>
                  </div>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Avantar Indica</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {!isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7 hover:bg-white/10 text-white"
              onClick={onToggle}
            >
              <Menu className="h-2 w-2" color="white" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-6 w-6 hover:bg-white/10 text-white absolute -top-1 -right-1"
                    onClick={onToggle}
                  >
                    <Menu className="h-3 w-3" color="white" />
                    <span className="sr-only">Expandir sidebar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir menu</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex-1 overflow-auto py-6 px-3 scrollbar-hide">
          <nav className="grid gap-1">
            <TooltipProvider delayDuration={0}>
              {routes.map((route) => (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex justify-start items-center gap-3 rounded-xl px-3 py-6 text-sm font-medium transition-all",
                        pathname === route.href
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:text-white hover:bg-white/10",
                        isCollapsed && "justify-center px-0"
                      )}
                      onClick={() => handleNavigation(route.href)}
                    >
                      <route.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <>
                          <span>{route.title}</span>
                          {pathname === route.href && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-white" />
                          )}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{route.title}</TooltipContent>
                  )}
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </div>
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-xl text-white/80 hover:text-white hover:bg-white/10",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={() => {
              signOut();
            }}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}