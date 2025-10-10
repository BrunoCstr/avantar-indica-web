"use client";

import { useState } from "react";
import { ChevronDown, Plus  } from "lucide-react";
import { BackButton } from "./back-button";
import { formatToCurrency } from "@/utils/formatCurrency";

interface CommissioningParameters {
  cashbackPerProduct: {
    auto: number;
    consorcio: number;
    empresarial: number;
    vida: number;
  };
  commissionPerProduct: {
    auto: number;
    consorcio: number;
    empresarial: number;
    vida: number;
  };
  defaultCashback: number;
  defaultCommission: number;
}

interface RulesComponentProps {
  title: string;
  titleDescription: string;
  description: string;
  titleDescription2: string;
  description2: string;
  titleDescription3: string;
  description3: string;
  rewards: string;
  bonusParameters: CommissioningParameters;
  unitName: string;
  updatedAt: string;
  showPartnerSection: boolean;
  userRule: string;
}

export function RulesComponent({
  title,
  titleDescription,
  description,
  titleDescription2,
  description2,
  titleDescription3,
  description3,
  rewards,
  bonusParameters,
  unitName,
  updatedAt,
  showPartnerSection,
  userRule,
}: RulesComponentProps) {
  const [expandedSections, setExpandedSections] = useState<{
    tipos: boolean;
    recompensas: boolean;
    bonificacao: boolean;
  }>({
    tipos: true,
    recompensas: false,
    bonificacao: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para formatar datas do Firestore ou objeto Timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp.toDate) {
      // Firestore Timestamp
      return timestamp.toDate().toLocaleDateString('pt-BR');
    }
    if (timestamp._seconds) {
      // Objeto bruto
      return new Date(timestamp._seconds * 1000).toLocaleDateString('pt-BR');
    }
    return String(timestamp);
  };

  return (
    <div className="min-h-screen bg-white-responsive dark:bg-dark-responsive">
      <div className="px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton bgColor="purple" route="/dashboard" />
        </div>

        {/* Main Card */}
        <div className="bg-primary-purple dark:bg-tertiary-purple rounded-3xl p-6 min-h-[600px]">
          {/* Title */}
          <h1 className="text-2xl font-bold text-blue text-center mb-8 uppercase tracking-wide">
            REGRAS
          </h1>

          {/* TIPOS DE USUÁRIOS Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("tipos")}
              className="w-full bg-white dark:bg-primary-purple rounded-t-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <h2 className="text-lg font-bold text-black dark:text-white uppercase tracking-wide">
                {title}
              </h2>
              <div className="w-8 h-8 bg-primary-purple dark:bg-blue border-2 border-primary-purple dark:border-blue rounded-full flex items-center justify-center">
                {expandedSections.tipos ? (
                  <div className="w-3 h-0.5 bg-white dark:bg-fifth-purple"></div>
                ) : (
                  <Plus className="w-4 h-4 text-white dark:text-fifth-purple" />
                )}
              </div>
            </button>

            {expandedSections.tipos && (
              <div className="bg-primary-purple dark:bg-tertiary-purple border-2 border-pink border-t-0 rounded-b-xl p-6 text-white space-y-6">
                {/* Cliente Indicador */}
                <div>
                  <h3 className="text-lg font-bold mb-3">{titleDescription}</h3>
                  <div className="space-y-2 text-sm leading-relaxed">
                    {description.split("\n").map((line, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-white mt-1"></span>
                        <span className="text-white">{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parceiro Indicador & Sub Indicador */}
                {showPartnerSection && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">
                      {titleDescription2}
                    </h3>
                    <div className="space-y-2 text-sm leading-relaxed">
                      {description2.split("\n").map((line, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-white mt-1"></span>
                          <span className="text-white">{line.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sua permissão atual */}
                <div>
                  <h3 className="text-lg font-bold text-blue mb-2">
                    {titleDescription3}
                  </h3>
                  <p className="text-white font-medium">{description3}</p>
                </div>
              </div>
            )}
          </div>

          {/* RECOMPENSAS Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("recompensas")}
              className="w-full bg-white dark:bg-primary-purple rounded-t-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <h2 className="text-lg font-bold text-black dark:text-white uppercase tracking-wide">
                RECOMPENSAS
              </h2>
              <div className="w-8 h-8 bg-primary-purple dark:bg-blue border-2 border-primary-purple dark:border-blue rounded-full flex items-center justify-center">
                {expandedSections.recompensas ? (
                  <div className="w-3 h-0.5 bg-white dark:bg-fifth-purple"></div>
                ) : (
                  <Plus className="w-4 h-4 text-white dark:text-fifth-purple" />
                )}
              </div>
            </button>

            {expandedSections.recompensas && (
              <div className="bg-primary-purple dark:bg-tertiary-purple border-2 border-pink border-t-0 rounded-b-xl p-6 text-white">
                <div className="space-y-2 text-sm leading-relaxed">
                  {rewards.split("\n").map((line, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-white mt-1"></span>
                      <span className="text-white">{line.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BONIFICAÇÃO Section */}
          <div>
            <button
              onClick={() => toggleSection("bonificacao")}
              className="w-full bg-white dark:bg-primary-purple rounded-t-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <h2 className="text-lg font-bold text-black dark:text-white uppercase tracking-wide">
                BONIFICAÇÃO
              </h2>
              <div className="w-8 h-8 bg-primary-purple dark:bg-blue border-2 border-primary-purple dark:border-blue rounded-full flex items-center justify-center">
                {expandedSections.bonificacao ? (
                  <div className="w-3 h-0.5 bg-white dark:bg-fifth-purple"></div>
                ) : (
                  <Plus className="w-4 h-4 text-white dark:text-fifth-purple" />
                )}
              </div>  
            </button>

            {expandedSections.bonificacao && (
              <div className="bg-primary-purple dark:bg-tertiary-purple border-2 border-pink border-t-0 rounded-b-xl p-6 text-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      Parâmetros de Bonificação
                    </h3>
                    <p className="text-sm text-blue font-bold mb-2">
                      {unitName}
                    </p>
                    
                    {/* Cashback por produto (para clientes) */}
                    {userRule !== 'parceiro_indicador' && (
                      <div className="space-y-2">
                        <p className="text-blue font-bold text-base">
                          Cashback por produto:
                        </p>
                        {bonusParameters?.cashbackPerProduct && (
                          <div className="space-y-1">
                            <p className="text-white text-sm">Auto: {formatToCurrency(bonusParameters.cashbackPerProduct.auto)}</p>
                            <p className="text-white text-sm">Consórcio: {formatToCurrency(bonusParameters.cashbackPerProduct.consorcio)}</p>
                            <p className="text-white text-sm">Empresarial: {formatToCurrency(bonusParameters.cashbackPerProduct.empresarial)}</p>
                            <p className="text-white text-sm">Vida: {formatToCurrency(bonusParameters.cashbackPerProduct.vida)}</p>
                          </div>
                        )}
                        <p className="text-white text-base mt-2">
                          <span className="text-blue font-bold">Demais ramos (cashback):</span> {formatToCurrency(bonusParameters?.defaultCashback || 0)}
                        </p>
                      </div>
                    )}

                    {/* Comissão por produto (para parceiros) */}
                    {userRule !== 'cliente_indicador' && (
                      <div className="space-y-2">
                        <p className="text-blue font-bold text-base">
                          Comissão por produto:
                        </p>
                        {bonusParameters?.commissionPerProduct && (
                          <div className="space-y-1">
                            <p className="text-white text-sm">Auto: {bonusParameters.commissionPerProduct.auto}%</p>
                            <p className="text-white text-sm">Consórcio: {bonusParameters.commissionPerProduct.consorcio}%</p>
                            <p className="text-white text-sm">Empresarial: {bonusParameters.commissionPerProduct.empresarial}%</p>
                            <p className="text-white text-sm">Vida: {bonusParameters.commissionPerProduct.vida}%</p>
                          </div>
                        )}
                        <p className="text-white text-base mt-2">
                          <span className="text-blue font-bold">Demais ramos (comissão):</span> {bonusParameters?.defaultCommission}%
                        </p>
                      </div>
                    )}

                    <p className="text-white font-bold text-base mt-4">
                      Última atualização: {formatDate(updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
