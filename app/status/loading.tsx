import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Skeleton } from "@/components/ui/skeleton"

export default function StatusLoading() {
  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-0">
        {/* Background - Mobile: bg-white-responsive | Desktop: cor sólida do tema */}
        <div className="lg:hidden">
          <PageBackground className="bg-white-responsive" />
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        <div className="relative z-10 p-6 lg:px-8 lg:py-6">
          {/* Header Skeleton */}
          <div className="mb-6 flex items-center justify-between lg:border-b lg:border-gray-200 dark:lg:border-tertiary-purple lg:pb-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <Skeleton className="w-12 h-12 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="w-12 lg:hidden" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-6">
            <Skeleton className="w-full h-14 rounded-2xl" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-3 lg:border-2 border-transparent dark:border-tertiary-purple shadow-md">
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>

          {/* List Items Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-tertiary-purple"
              >
                <div className="flex items-center">
                  <Skeleton className="w-12 h-12 rounded-full mr-4" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-40 mb-2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}
