import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b backdrop-blur px-2 md:px-6 bg-white border-gray-200 dark:bg-[#190d26] dark:border-[#9093A0]/20">
      <div className="flex flex-1 items-center justify-between">
        {/* Título */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-600" />
        </div>

        {/* Ações à direita */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Notificações */}
          <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />

          {/* Alternar tema */}
          <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />

          {/* Avatar e nome */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
            <Skeleton className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-600 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
