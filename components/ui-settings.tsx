"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUISettings } from "@/hooks/useUISettings";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UISettings() {
  const { sidebarCollapsed, theme, updateSidebarCollapsed, updateTheme } = useUISettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Interface</CardTitle>
        <CardDescription>
          Personalize a aparência e comportamento da interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuração do Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Barra Lateral Recolhida</Label>
              <p className="text-sm text-muted-foreground">
                Mantenha a sidebar em modo compacto
              </p>
            </div>
            <Switch
              checked={sidebarCollapsed}
              onCheckedChange={updateSidebarCollapsed}
            />
          </div>
        </div>

        <Separator />

        {/* Configuração do Tema */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">Tema</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha o tema de cores da interface
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => updateTheme("light")}
            >
              <Sun className="h-5 w-5" />
              <span>Claro</span>
            </Button>
            
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => updateTheme("dark")}
            >
              <Moon className="h-5 w-5" />
              <span>Escuro</span>
            </Button>
            
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => updateTheme("system")}
            >
              <Monitor className="h-5 w-5" />
              <span>Sistema</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 