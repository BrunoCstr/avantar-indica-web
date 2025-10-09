"use client";

import { useState } from "react";
import { ChevronDown, Plus  } from "lucide-react";
import { BackButton } from "./back-button";

interface RulesComponentProps {
  title: string;
  titleDescription: string;
  description: string;
  titleDescription2: string;
  description2: string;
  titleDescription3: string;
  description3: string;
  rewards: string;
  bonusParameters: any;
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

  return (
    <div className="min-h-screen bg-white-responsive dark:bg-dark-responsive">
      <div className="px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton bgColor="#4A04A5" />
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
              className="w-full bg-gradient-to-r from-avantar-primary/10 to-avantar-secondary/10 dark:from-avantar-primary/20 dark:to-avantar-secondary/20 rounded-t-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <h2 className="text-lg font-bold text-white dark:text-white uppercase tracking-wide">
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
              <div className="bg-primary-purple dark:bg-tertiary-purple border-2 rounded-b-2xl p-6 text-white space-y-6">
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
              className="w-full bg-gradient-to-r from-avantar-primary/10 to-avantar-secondary/10 dark:from-avantar-primary/20 dark:to-avantar-secondary/20 rounded-t-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <h2 className="text-lg font-bold text-white dark:text-white uppercase tracking-wide">
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
              <div className="bg-primary-purple dark:bg-tertiary-purple border-2 rounded-b-2xl p-6 text-white">
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
              className="w-full bg-gradient-to-r from-avantar-primary/10 to-avantar-secondary/10 dark:from-avantar-primary/20 dark:to-avantar-secondary/20 rounded-t-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <h2 className="text-lg font-bold text-white dark:text-white uppercase tracking-wide">
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
              <div className="bg-primary-purple dark:bg-tertiary-purple border-2 rounded-b-2xl p-6 text-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      Parâmetros de Bonificação
                    </h3>
                    <p className="text-sm text-gray-300">
                      Configurado por: {unitName}
                    </p>
                    <p className="text-sm text-gray-300">
                      Última atualização: {updatedAt}
                    </p>
                  </div>

                  {bonusParameters && (
                    <div className="space-y-2 text-sm leading-relaxed">
                      <p className="text-white">
                         As bonificações são calculadas conforme os parâmetros
                        configurados pela sua unidade.
                      </p>
                      <p className="text-white">
                         Valores podem variar de acordo com o produto e tipo de
                        cliente.
                      </p>
                      <p className="text-white">
                         Consulte sempre os valores atualizados antes de fazer
                        indicações.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
