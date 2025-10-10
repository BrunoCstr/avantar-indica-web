import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarteiraLoading() {
  return (
    <>
      <DesktopSidebar />

      <PageContainer>
        {/* Background - Mobile: bg-white-responsive | Desktop: cor sólida do tema */}
        <div className="lg:hidden">
          <PageBackground className="bg-white-responsive" />
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        {/* LAYOUT MOBILE */}
        <div className="lg:hidden relative z-10 flex flex-col min-h-screen">
          {/* Header com botão de voltar */}
          <div className="pt-10">
            <div className="flex justify-between items-center px-6">
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </div>

          {/* Card principal com saldo */}
          <div className="px-6 mt-6">
            <Skeleton className="w-full h-28 rounded-3xl" />

            {/* Área de transações */}
            <div className="bg-white border border-[#CDCDCD] border-t-0 rounded-br-3xl rounded-bl-3xl h-32 px-4 py-3">
              <div className="space-y-2">
                <Skeleton className="w-full h-10 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
              </div>
            </div>

            {/* Botão Sacar */}
            <div className="mt-6">
              <Skeleton className="w-full h-20 rounded-lg" />
            </div>

            {/* Dashboard Chart */}
            <div className="mt-6">
              <Skeleton className="w-full h-64 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* LAYOUT DESKTOP */}
        <div className="hidden lg:block relative z-10">
          <div className="px-8 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Coluna Principal - Carteira e Saque (8 colunas) */}
              <div className="col-span-8 space-y-6">
                {/* Card de Saldo */}
                <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>

                  <Skeleton className="w-full h-40 rounded-xl" />
                </div>

                {/* Histórico de Saques */}
                <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-50 dark:bg-[#4A04A5]/10 border border-gray-100 dark:border-[#4A04A5]/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-2" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-20 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna Lateral - Dashboard de Recebimentos (4 colunas) */}
              <div className="col-span-4 space-y-6">
                {/* Resumo Financeiro */}
                <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-6 shadow-sm">
                  <Skeleton className="h-6 w-40 mb-6" />
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg p-4 border">
                        <Skeleton className="h-3 w-32 mb-2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico de Recebimentos */}
                <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-6 shadow-sm">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="w-full h-64 rounded-lg" />
                </div>

                {/* Informações */}
                <div className="rounded-xl p-6 border">
                  <Skeleton className="h-5 w-48 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

