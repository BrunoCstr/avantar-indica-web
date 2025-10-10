"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Moon, Sun, User, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/Auth";
import { useUISettings } from "@/hooks/useUISettings";
import {
  getCounterUnredNotifications,
  getThreeLastNotifications,
  markAllNotificationsAsRead,
} from "@/services/notifications/notifications";
import { HeaderSkeleton } from "./skeletons/header-skeleton/header";

interface HeaderProps {
  userType: "cliente_indicador" | "parceiro_indicador";
}

export function Header({ userType }: HeaderProps) {
  const { userData, signOut } = useAuth();
  const { updateTheme, sidebarCollapsed } = useUISettings();
  const [counterNotifications, setCounterNotifications] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const username = userData?.displayName;
  const profilePicture = userData?.profilePicture;
  const fullName = userData?.displayName;
  const firstName = fullName?.split(" ")[0];
  const isFirstLogin  = userData;

  console.log(isFirstLogin);

  useEffect(() => {
    if (!userData?.uid) return;

    try {
      const fetchNotificationsCount = async () => {
        const count = await getCounterUnredNotifications(userData.uid);
        setCounterNotifications(count || 0);
      };

      const fetchThreeLastNotifications = async () => {
        const notifications = await getThreeLastNotifications(userData.uid);
        setNotifications(notifications || []);
      };

      fetchThreeLastNotifications();
      fetchNotificationsCount();
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  }, [userData?.uid]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}min atrás`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d atrás`;

    return date.toLocaleDateString("pt-BR");
  };

  if (!userData) {
    return <HeaderSkeleton />;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-2 border-b backdrop-blur px-2 md:px-6",
        "bg-white border-gray-200",
        "dark:bg-[#190d26] dark:border-[#9093A0]/20"
      )}
    >
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="md:ml-0 ml-14 text-lg md:text-xl font-bold text-fifth-purple dark:text-white truncate">
            Olá, <span className="text-primary-purple dark:text-blue">{firstName}</span> seja {isFirstLogin ? "bem-vindo! 👋" : "bem-vindo de volta! 👋"}
          </h1>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) {
                markAllNotificationsAsRead(userData?.uid || "");
                setCounterNotifications(0);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full h-8 w-8 bg-gray-100 border-gray-200 hover:bg-primary-purple/10 hover:border-primary-purple text-gray-600 hover:text-primary-purple dark:bg-tertiary-purple dark:border-tertiary-purple dark:text-white dark:hover:bg-blue/20 dark:hover:border-blue transition-colors"
              >
                <Bell className="h-4 w-4" />
                {counterNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue text-white font-bold text-[10px]">
                    {counterNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto scrollbar-hide">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="py-3 cursor-pointer"
                  >
                    <div
                      className="flex flex-col gap-1"
                      onClick={() =>
                        (window.location.href = `${notification.type === "Solicitação de afiliação" ? "affiliation_request" : notification.type === "Indicação" ? "indication_received" : notification.type === "mass_indication_received" ? "indicacoes-em-massa" : ""}`)
                      }
                    >
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt.toDate())}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && (
                  <DropdownMenuItem className="py-3 text-center text-muted-foreground">
                    Nenhuma notificação.
                  </DropdownMenuItem>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center font-medium text-primary-purple dark:text-blue cursor-pointer">
                <Link
                  href={`/notificacoes`}
                  className="w-full flex items-center justify-center"
                >
                  Ver todas as notificações
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 bg-gray-100 border-gray-200 hover:bg-primary-purple/10 hover:border-primary-purple text-gray-600 hover:text-primary-purple dark:bg-tertiary-purple dark:border-tertiary-purple dark:text-white dark:hover:bg-blue/20 dark:hover:border-blue transition-colors"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateTheme("light")}>
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateTheme("dark")}>
                Escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateTheme("system")}>
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 rounded-full pl-1 pr-2 md:pl-2 md:pr-4 h-8 bg-gray-100 border-gray-200 hover:bg-primary-purple/10 hover:border-primary-purple text-gray-600 hover:text-primary-purple dark:bg-tertiary-purple dark:border-tertiary-purple dark:text-white dark:hover:bg-blue/20 dark:hover:border-blue transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={profilePicture}
                    alt={username}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary-purple dark:bg-blue text-white text-xs">
                    {username ??
                      ""
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block font-medium text-xs md:text-sm truncate max-w-[150px]">
                  {username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Link
                  href={`/perfil`}
                  className="w-full flex items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Link
                  href="/login"
                  className="w-full flex items-center"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
