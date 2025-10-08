"use client"

import { RulesComponent } from "@/components/rules-component"

export default function RegrasPage() {
  // Dados de exemplo - substitua pelos dados reais da sua aplicação
  const userData = {
    rule: 'admin_franqueadora' // ou 'cliente_indicador'
  }

  const userRule = userData?.rule === 'admin_franqueadora' ? 'Admin Franqueadora' : 'Cliente Indicador'
  
  const commissioningParameters = {
    // Parâmetros de bonificação
    insurance: 30,
    consortium: 25,
    healthPlan: 20
  }

  const unitName = "Unidade Central"
  const updatedAt = "15/01/2024"

  return (
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
      bonusParameters={commissioningParameters}
      unitName={unitName}
      updatedAt={updatedAt}
      showPartnerSection={userData?.rule !== 'cliente_indicador'}
      userRule={userData?.rule}
    />
  )
}
