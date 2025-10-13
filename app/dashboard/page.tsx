"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { PageContainer, PageBackground } from "@/components/page-container";
import { StatsCard } from "@/components/stats-card";
import { IndicarModal } from "@/components/indicar-modal";
import IndicationsChart from "@/components/indications-chart";
import {
  BellRing,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Sliders,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/Auth";
import { AlertModal } from "@/components/alert-modal";
import { getAllCardsData } from "@/services/dashboard/cards";
import { fetchMonthPerformanceData, PerformanceData } from "@/services/dashboard/performance-of-month";

export default function DashboardPage() {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const [isIndicarModalOpen, setIsIndicarModalOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [cardsData, setCardsData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);

  // Pegando os dados dos cards
  useEffect(() => {
    if (!userData?.uid) return;
    const fetchData = async () => {
      const data = await getAllCardsData(userData?.uid);
      setCardsData(data as any[]);
    };
    fetchData();
  }, [userData?.uid]);

  // Pegando os dados de performance do mês
  useEffect(() => {
    if (!userData?.uid) return;
    const fetchPerformance = async () => {
      try {
        setIsLoadingPerformance(true);
        const data = await fetchMonthPerformanceData(userData.uid);
        setPerformanceData(data);
      } catch (error) {
        console.error("Erro ao buscar dados de performance:", error);
      } finally {
        setIsLoadingPerformance(false);
      }
    };
    fetchPerformance();
  }, [userData?.uid]);

  const handleIndicarClick = () => {
    if (userData?.rule === "nao_definida") {
      setShowAlertModal(true);
      return;
    }
    setIsIndicarModalOpen(true);
  };

  const handleIndicarMultiplosClick = (e: React.MouseEvent) => {
    if (userData?.rule === "nao_definida") {
      e.preventDefault();
      setShowAlertModal(true);
      return;
    }
  };

  // Mostra loading enquanto carrega os dados de autenticação
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#190d26] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary-purple dark:text-white mt-4">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  const firstName = userData.displayName.split(" ")[0];

  return (
    <>
      {/* Sidebar apenas para Desktop */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      <PageContainer>
        {/* Background image - Desktop */}
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        {/* Background image - Mobile com imagem bg_home.png */}
        <div className="lg:hidden fixed inset-0 z-0">
          <div className="absolute inset-0 bg-dark-responsive" />
        </div>

        {/* Content Mobile - Scroll Container */}
        <div className="lg:hidden relative z-10 overflow-y-auto h-screen pb-24">
          <div className="flex flex-col min-h-full">
            {/* Header Mobile - NOVO DESIGN IDENTICO AO REACT NATIVE */}
            <div className="pt-14 px-6 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-blue transition-colors">
                    <img
                      src={userData?.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-medium text-blue">
                        Olá,
                      </span>
                      <span className="text-lg font-medium text-white">
                        {firstName}
                      </span>
                    </div>
                    <p className="text-sm text-white">
                      Seja bem-vindo de volta!
                    </p>
                  </div>
                </div>
                <button className="mr-4">
                  <BellRing className="w-7 h-7 text-blue" />
                </button>
              </div>
            </div>

            {/* Action Buttons - MOBILE: Dois botões lado a lado */}
            <div className="px-6">
              <div className="flex gap-3 h-20">
                <button
                  onClick={handleIndicarClick}
                  className="flex-1 bg-transparent border-[1.5px] border-blue rounded-lg flex items-center justify-center gap-1 hover:bg-blue/10 transition-colors"
                >
                  <img
                    src="/indicar_icon.svg"
                    alt="Indicar"
                    className="w-6 h-6"
                  />
                  <span className="text-white font-normal text-lg ml-1">
                    INDICAR
                  </span>
                </button>

                <Link
                  href="/indicar-multiplos"
                  onClick={handleIndicarMultiplosClick}
                  className="flex-1 bg-transparent border-[1.5px] border-blue rounded-lg flex items-center justify-center gap-0.5 hover:bg-blue/10 transition-colors"
                >
                  <img
                    src="/indicar_em_massa_icon_blue.svg"
                    alt="Indicar Múltiplos"
                    className="w-6 h-6"
                  />
                  <div className="flex flex-col items-start ml-0.5">
                    <span className="text-white font-normal text-lg leading-tight">
                      INDICAR
                    </span>
                    <span className="text-white font-normal text-sm leading-tight ml-1">
                      MÚLTIPLOS
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Botão REGRAS - MOBILE */}
            <div className="px-6 mt-5">
              <Link
                href="/regras"
                className="block w-full bg-[#E06400] text-white font-bold py-[1.5rem] px-6 rounded-2xl text-center text-[22px] shadow-[4px_4px_0px_0px_#F28907]"
              >
                REGRAS
              </Link>
            </div>

            {/* Indicações Card - MOBILE */}
            <div className="px-6 mt-5">
              <div className="bg-white rounded-2xl pt-4 pb-4 px-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary-purple">
                    Indicações e Oportunidades
                  </h2>
                </div>
                
                {/* Gráfico de Indicações */}
                <IndicationsChart />
              </div>
            </div>

            {/* Botão STATUS DAS PROPOSTAS - MOBILE */}
            <div className="px-6 mt-5 pb-6">
              <Link
                href="/status"
                className="block w-full bg-gradient-to-r from-[#C352F2] to-[#C352F2]/80 text-white font-bold py-[1.5rem] px-6 rounded-2xl text-center text-[22px] shadow-[4px_4px_0px_0px_#8822ED]"
              >
                STATUS DAS PROPOSTAS
              </Link>
            </div>
          </div>
        </div>

        {/* Content Desktop */}
        <div className="hidden lg:block relative z-10">
          {/* Stats Cards - Desktop */}
          <div className="grid grid-cols-4 gap-4 px-8 py-4">
            <StatsCard
              title="Total de Indicações (Mês)"
              value={cardsData[0] || 0}
              icon={Users}
              color="cyan"
            />
            <StatsCard
              title="Indicações Fechadas (Mês)"
              value={cardsData[1] || 0}
              icon={Target}
              color="purple"
            />
            <StatsCard
              title="Comissão Total (Mês)"
              value={cardsData[2] || "R$ 0,00"}
              icon={DollarSign}
              color="orange"
            />
            <StatsCard
              title="Taxa de Conversão (Mês)"
              value={cardsData[3] || "0,00%"}
              icon={TrendingUp}
              color="pink"
            />
          </div>

          {/* Main Content Area */}
          <div className="px-8 py-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Main content - 8 columns on desktop */}
              <div className="col-span-8 space-y-4">
                {/* Action Buttons - DESKTOP: 3 botões em linha */}
                <div className="px-0">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleIndicarClick}
                      className="cursor-pointer bg-gradient-to-br from-[#29F3DF]/20 to-[#29F3DF]/5 border-2 border-[#29F3DF] rounded-xl p-6 hover:from-[#29F3DF]/30 hover:to-[#29F3DF]/10 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#29F3DF]/20 group-hover:bg-[#29F3DF]/30 transition-colors">
                        <img
                          src="/indicar_icon.svg"
                          alt="Indicar"
                          className="w-7 h-7"
                        />
                      </div>
                      <h3 className="text-black dark:text-white font-bold text-base">
                        INDICAR
                      </h3>
                    </button>

                    <Link
                      href="/indicar-multiplos"
                      onClick={handleIndicarMultiplosClick}
                      className="bg-gradient-to-br from-[#C352F2]/20 to-[#C352F2]/5 border-2 border-[#C352F2] rounded-xl p-6 hover:from-[#C352F2]/30 hover:to-[#C352F2]/10 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#C352F2]/20 group-hover:bg-[#C352F2]/30 transition-colors flex items-center justify-center">
                        <img
                          src="/indicar_em_massa_icon.svg"
                          alt="Indicar em Massa"
                          className="w-12 h-12"
                        />
                      </div>
                      <h3 className="text-black dark:text-white font-bold text-base text-center">
                        INDICAR MÚLTIPLOS
                      </h3>
                    </Link>

                    {/* Botão REGRAS na mesma linha no desktop */}
                    <Link
                      href="/regras"
                      className="bg-gradient-to-br from-[#F28907]/20 to-[#F28907]/5 border-2 border-[#F28907] rounded-xl p-6 hover:from-[#F28907]/30 hover:to-[#F28907]/10 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#F28907]/20 group-hover:bg-[#F28907]/30 transition-colors flex items-center justify-center">
                        <Shield className="w-7 h-7 text-[#E06400]" />
                      </div>
                      <h3 className="text-black dark:text-white font-bold text-base">
                        REGRAS
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* Indicações Card - DESKTOP */}
                <div className="mx-0">
                  <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-black dark:text-white">
                        Indicações e Oportunidades
                      </h2>
                    </div>

                    {/* Gráfico de Indicações */}
                    <IndicationsChart />
                  </div>
                </div>
              </div>

              {/* Sidebar - 4 columns on desktop */}
              <div className="col-span-4 space-y-4">
                {/* Quick Stats - Desempenho do Mês */}
                <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-bold text-black dark:text-white mb-4">
                    Desempenho do Mês
                  </h3>
                  
                  {isLoadingPerformance ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A04A5]"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Indicações Pendentes */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#4A04A5]/5 to-[#4A04A5]/10 rounded-lg">
                        <span className="text-black dark:text-gray text-xs font-medium">
                          Indicações Pendentes
                        </span>
                        <span className="font-bold text-[#4A04A5] dark:text-[#C352F2] text-sm">
                          {performanceData?.pendingIndications || 0}
                        </span>
                      </div>

                      {/* Oportunidades em Andamento */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#29F3DF]/5 to-[#29F3DF]/10 rounded-lg">
                        <span className="text-black dark:text-gray text-xs font-medium">
                          Oportunidades em Andamento
                        </span>
                        <span className="font-bold text-[#29F3DF] text-sm">
                          {performanceData?.ongoingOpportunities || 0}
                        </span>
                      </div>

                      {/* Oportunidades Fechadas */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-lg">
                        <span className="text-black dark:text-gray text-xs font-medium">
                          Oportunidades Fechadas
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400 text-sm">
                          {performanceData?.closedOpportunities || 0}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-600 my-3"></div>

                      {/* Saques Pendentes */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/5 to-orange-500/10 rounded-lg">
                        <span className="text-black dark:text-gray text-xs font-medium">
                          Saques Pendentes
                        </span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                          {performanceData?.pendingWithdrawals || 0}
                        </span>
                      </div>

                      {/* Saques Pagos */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-lg">
                        <span className="text-black dark:text-gray text-xs font-medium">
                          Saques Pagos
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {performanceData?.paidWithdrawals || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-bold text-black dark:text-white mb-4">
                    Ações Rápidas
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href="/status"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#C352F2]/10 to-transparent hover:from-[#C352F2]/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#C352F2]/20 flex items-center justify-center group-hover:bg-[#C352F2]/30 transition-colors">
                        <Target className="w-4 h-4 text-[#C352F2]" />
                      </div>
                      <span className="text-sm font-medium text-black dark:text-white">
                        Status das Propostas
                      </span>
                    </Link>

                    <Link
                      href="/carteira"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#29F3DF]/10 to-transparent hover:from-[#29F3DF]/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#29F3DF]/20 flex items-center justify-center group-hover:bg-[#29F3DF]/30 transition-colors">
                        <DollarSign className="w-4 h-4 text-[#29F3DF]" />
                      </div>
                      <span className="text-sm font-medium text-black dark:text-white">
                        Minha Carteira
                      </span>
                    </Link>

                    <Link
                      href="/vendedores"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#F28907]/10 to-transparent hover:from-[#F28907]/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F28907]/20 flex items-center justify-center group-hover:bg-[#F28907]/30 transition-colors">
                        <Users className="w-4 h-4 text-[#F28907]" />
                      </div>
                      <span className="text-sm font-medium text-black dark:text-white">
                        Vendedores
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomNav onIndicarClick={handleIndicarClick} />
      </PageContainer>

      {/* Indicar Modal */}
      <IndicarModal
        isOpen={isIndicarModalOpen}
        onClose={() => setIsIndicarModalOpen(false)}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Cadastro Pendente"
        message="Seu cadastro ainda não foi aprovado pela unidade. Aguarde a aprovação para poder fazer indicações."
      />
    </>
  );
}
