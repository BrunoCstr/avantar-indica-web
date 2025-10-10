"use client"

import { useState, useEffect } from "react"
import { BackButton } from "@/components/back-button"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { RulesComponent } from "@/components/rules-component"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/context/Auth"
import { fetchUnitData, formatRule, UnitData } from "@/services/rules/unit-data"
import { formatToCurrency } from "@/utils/formatCurrency"
import { ChevronDown, Plus } from "lucide-react"

export default function RegrasPage() {
  const { userData } = useAuth()
  const [unitData, setUnitData] = useState<UnitData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUnit = async () => {
      if (!userData?.affiliated_to) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const data = await fetchUnitData(userData.affiliated_to)
        setUnitData(data)
      } catch (error) {
        console.error("Erro ao buscar dados da unidade:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUnit()
  }, [userData?.affiliated_to])

  const userRule = formatRule(userData?.rule)
  const unitName = unitData?.name || "Unidade"
  const updatedAt = unitData?.updatedAt?.toDate?.()?.toLocaleDateString("pt-BR") || "Data não disponível"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#190d26] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary-purple dark:text-white mt-4">
            Carregando regras...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Sidebar apenas para Desktop */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      <PageContainer showHeader={true}>
        {/* Background - Desktop com cor sólida */}
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        {/* Background - Mobile com imagem bg_white_responsive */}
        <div className="lg:hidden fixed inset-0 z-0">
          <div className="absolute inset-0 bg-white-responsive" />
        </div>

        {/* MOBILE VERSION - Mantém exatamente como está */}
        <div className="lg:hidden min-h-screen relative z-10 pb-24">
    <RulesComponent
      title="TIPOS DE USUÁRIOS"
      titleDescription="Cliente Indicador"
      description={`• Pode indicar amigos e familiares para contratação de seguros.
• Recebe cashback em forma de desconto na renovação ou contratação de novos seguros.
• Não é possível sacar dinheiro, apenas trocar por benefícios.
• Cadastro simples, com vinculação a uma unidade.`}
      titleDescription2="Parceiro Indicador & Sub Indicador"
      description2={`• Indicadores profissionais autorizados por uma unidade franqueada.
• Pode indicar normalmente e resgatar valores em dinheiro, com valor mínimo de saque equivalente a meio salário mínimo.
• Somente Parceiro Indicador pode cadastrar sub-indicadores (ex: equipe de vendas).`}
      titleDescription3="Sua permissão atual:"
      description3={userRule}
      rewards={`• As recompensas variam de acordo com o produto indicado configurado pela sua unidade.
• Cada produto possui um valor de recompensa diferente.
• Franqueados podem personalizar os valores de cashback para campanhas específicas.
• O sistema aceita personalização de recompensas tanto para clientes quanto para parceiros.
• Para parceiros indicadores, saque mínimo de meio salário mínimo.`}
            bonusParameters={unitData?.bonusParameters || {
              cashbackPerProduct: { auto: 0, consorcio: 0, empresarial: 0, vida: 0 },
              commissionPerProduct: { auto: 0, consorcio: 0, empresarial: 0, vida: 0 },
              defaultCashback: 0,
              defaultCommission: 0
            }}
      unitName={unitName}
      updatedAt={updatedAt}
            showPartnerSection={userData?.rule !== "cliente_indicador"}
            userRule={userData?.rule || ""}
          />
          
          {/* Bottom Navigation */}
          <BottomNav />
        </div>

        {/* DESKTOP VERSION - Nova Interface Web */}
        <div className="hidden lg:block relative z-10 min-h-screen">
          <div className="px-8 py-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-black dark:text-white">Regras</h1>
              <p className="text-sm text-black dark:text-gray mt-1">
                Conheça as regras e parâmetros do sistema
              </p>
            </div>

            {/* Desktop Rules Interface */}
            <div className="grid grid-cols-1 gap-6">
              {/* Main Content Card */}
              <div className="bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">
                  REGRAS DO SISTEMA
                </h2>

                {/* Desktop Rules Sections */}
                <div className="space-y-6">
                  {/* TIPOS DE USUÁRIOS */}
                  <div className="bg-gradient-to-r from-[#4A04A5]/5 to-[#C352F2]/5 border border-[#4A04A5]/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#4A04A5] dark:text-[#C352F2] mb-4">
                      TIPOS DE USUÁRIOS
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Cliente Indicador */}
                      <div className="bg-white dark:bg-[#190d26] rounded-lg p-6 border border-gray-200 dark:border-tertiary-purple">
                        <h4 className="text-lg font-bold text-black dark:text-white mb-3">
                          Cliente Indicador
                        </h4>
                        <ul className="space-y-2 text-sm text-black dark:text-gray">
                          <li>• Pode indicar amigos e familiares para contratação de seguros</li>
                          <li>• Recebe cashback em forma de desconto na renovação ou contratação</li>
                          <li>• Não é possível sacar dinheiro, apenas trocar por benefícios</li>
                          <li>• Cadastro simples, com vinculação a uma unidade</li>
                        </ul>
                      </div>

                      {/* Parceiro Indicador & Sub Indicador */}
                      {userData?.rule !== "cliente_indicador" && (
                        <div className="bg-white dark:bg-[#190d26] rounded-lg p-6 border border-gray-200 dark:border-tertiary-purple">
                          <h4 className="text-lg font-bold text-black dark:text-white mb-3">
                            Parceiro Indicador & Sub Indicador
                          </h4>
                          <ul className="space-y-2 text-sm text-black dark:text-gray">
                            <li>• Indicadores profissionais autorizados por uma unidade franqueada</li>
                            <li>• Pode indicar normalmente e resgatar valores em dinheiro</li>
                            <li>• Valor mínimo de saque equivalente a meio salário mínimo</li>
                            <li>• Parceiro Indicador pode cadastrar sub-indicadores</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Sua permissão atual */}
                    <div className="mt-6 p-4 bg-[#4A04A5]/10 dark:bg-[#C352F2]/10 rounded-lg">
                      <h4 className="text-lg font-bold text-[#4A04A5] dark:text-[#C352F2] mb-2">
                        Sua permissão atual:
                      </h4>
                      <p className="text-black dark:text-white font-medium">{userRule}</p>
                    </div>
                  </div>

                  {/* RECOMPENSAS */}
                  <div className="bg-gradient-to-r from-[#29F3DF]/5 to-[#29F3DF]/10 border border-[#29F3DF]/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-black mb-4">
                      RECOMPENSAS
                    </h3>
                    <div className="bg-white dark:bg-[#190d26] rounded-lg p-6 border border-gray-200 dark:border-tertiary-purple">
                      <ul className="space-y-2 text-sm text-black dark:text-gray">
                        <li>• As recompensas variam de acordo com o produto indicado configurado pela sua unidade</li>
                        <li>• Cada produto possui um valor de recompensa diferente</li>
                        <li>• Franqueados podem personalizar os valores de cashback para campanhas específicas</li>
                        <li>• O sistema aceita personalização de recompensas tanto para clientes quanto para parceiros</li>
                        <li>• Para parceiros indicadores, saque mínimo de meio salário mínimo</li>
                      </ul>
                    </div>
                  </div>

                  {/* BONIFICAÇÃO */}
                  <div className="bg-gradient-to-r from-[#F28907]/5 to-[#F28907]/10 border border-[#F28907]/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-[#F28907] mb-4">
                      BONIFICAÇÃO
                    </h3>
                    <div className="bg-white dark:bg-[#190d26] rounded-lg p-6 border border-gray-200 dark:border-tertiary-purple">
                      <div className="mb-4">
                        <h4 className="text-lg font-bold text-black dark:text-white mb-2">
                          Parâmetros de Bonificação
                        </h4>
                        <p className="text-sm text-black dark:text-gray mb-1">
                          Configurado por: <span className="font-medium">{unitName}</span>
                        </p>
                        <p className="text-sm text-black dark:text-gray">
                          Última atualização: <span className="font-medium">{updatedAt}</span>
                        </p>
                      </div>

                      {unitData?.bonusParameters ? (
                        <div className="space-y-6">
                          {/* Cashback por produto (para clientes) */}
                          {userData?.rule !== 'parceiro_indicador' && (
                            <div>
                              <h4 className="text-base font-bold text-[#4A04A5] dark:text-[#C352F2] mb-3">
                                Cashback por produto:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-gradient-to-r from-[#4A04A5]/5 to-[#4A04A5]/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Auto:</span> {formatToCurrency(unitData.bonusParameters.cashbackPerProduct.auto)}
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-[#4A04A5]/5 to-[#4A04A5]/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Consórcio:</span> {formatToCurrency(unitData.bonusParameters.cashbackPerProduct.consorcio)}
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-[#4A04A5]/5 to-[#4A04A5]/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Empresarial:</span> {formatToCurrency(unitData.bonusParameters.cashbackPerProduct.empresarial)}
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-[#4A04A5]/5 to-[#4A04A5]/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Vida:</span> {formatToCurrency(unitData.bonusParameters.cashbackPerProduct.vida)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 p-3 bg-gradient-to-r from-orange/5 to-orange/10 rounded-lg">
                                <p className="text-sm text-black dark:text-gray">
                                  <span className="font-bold text-orange">Demais ramos (cashback):</span> {formatToCurrency(unitData.bonusParameters.defaultCashback)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Comissão por produto (para parceiros) */}
                          {userData?.rule !== 'cliente_indicador' && (
                            <div>
                              <h4 className="text-base font-bold text-orange mb-3">
                                Comissão por produto:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-gradient-to-r from-orange/5 to-orange/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Auto:</span> {unitData.bonusParameters.commissionPerProduct.auto}%
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-orange/5 to-orange/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Consórcio:</span> {unitData.bonusParameters.commissionPerProduct.consorcio}%
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-orange/5 to-orange/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Empresarial:</span> {unitData.bonusParameters.commissionPerProduct.empresarial}%
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-orange/5 to-orange/10 p-3 rounded-lg">
                                  <p className="text-sm text-black dark:text-gray">
                                    <span className="font-medium">Vida:</span> {unitData.bonusParameters.commissionPerProduct.vida}%
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 p-3 bg-gradient-to-r from-[#4A04A5]/5 to-[#4A04A5]/10 rounded-lg">
                                <p className="text-sm text-black dark:text-gray">
                                  <span className="font-bold text-[#4A04A5] dark:text-[#C352F2]">Demais ramos (comissão):</span> {unitData.bonusParameters.defaultCommission}%
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-black dark:text-gray">
                            Parâmetros de bonificação não configurados pela unidade
                          </p>
                        </div>
                      )}
                    </div>
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