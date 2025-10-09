import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 backdrop-blur px-2 md:px-6">
      <div className="flex flex-1 items-center justify-between">
        {/* Título */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-40 rounded" />
        </div>

        {/* Ações à direita */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Notificações */}
          <Skeleton className="h-8 w-8 rounded-full" />

          {/* Alternar tema */}
          <Skeleton className="h-8 w-8 rounded-full" />

          {/* Avatar e nome */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20 rounded hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
