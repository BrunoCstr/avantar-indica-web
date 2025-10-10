"use client"

import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'
import { useAuth } from '@/context/Auth'
import { 
  fetchIndicationsChartData, 
  IndicationChartDataItem,
  IndicationChartData 
} from '@/services/dashboard/indications-chart'

const IndicationsChart = () => {
  const { userData } = useAuth()
  const [data, setData] = useState<IndicationChartData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Ano')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const chartData = await fetchIndicationsChartData(userData.uid)
        setData(chartData)
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userData?.uid])

  // Função para obter o período atual
  const getCurrentPeriod = () => {
    const now = new Date()

    switch (selectedPeriod) {
      case 'Semana':
        return now.getDay()
      case 'Mês':
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const dayOfMonth = now.getDate()
        const weekOfMonth = Math.ceil((dayOfMonth + firstDay.getDay()) / 7)
        return Math.min(weekOfMonth, 5)
      case 'Ano':
        return now.getMonth()
      default:
        return 0
    }
  }

  // Função para obter os dados baseado no período selecionado
  const getChartData = (): IndicationChartDataItem[] => {
    if (!data) return []

    let periodData: IndicationChartDataItem[] = []

    switch (selectedPeriod) {
      case 'Semana':
        periodData = data.week || []
        break
      case 'Mês':
        periodData = data.month || []
        break
      case 'Ano':
        periodData = data.year || []
        break
      default:
        periodData = data.year || []
    }

    const currentPeriod = getCurrentPeriod()

    // Filtrar dados até o período atual
    let filteredData = periodData
    if (selectedPeriod === 'Semana') {
      filteredData = periodData.slice(0, currentPeriod + 1)
    } else if (selectedPeriod === 'Mês') {
      filteredData = periodData.slice(0, currentPeriod)
    } else if (selectedPeriod === 'Ano') {
      filteredData = periodData.slice(0, currentPeriod + 1)
    }

    return filteredData
  }

  const chartData = getChartData()

  // Função personalizada para tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-[#190d26] rounded-lg shadow-lg border border-gray-200 dark:border-tertiary-purple overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A04A5]/10 to-[#4A04A5]/10 dark:from-[#4A04A5]/20 dark:to-[#4A04A5]/20 p-3">
            <p className="font-semibold text-black dark:text-blue">{label}</p>
          </div>
          {/* Conteúdo */}
          <div className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4A04A5]"></div>
              <p className="text-sm text-black dark:text-gray">
                Indicações: <span className="font-bold text-[#4A04A5]">{data.indications}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#29F3DF]"></div>
              <p className="text-sm text-black dark:text-gray">
                Oportunidades: <span className="font-bold text-[#29F3DF]">{data.opportunities}</span>
              </p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Função para renderizar legenda customizada
  const CustomLegend = () => (
    <div className="flex items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#4A04A5]"></div>
        <span className="text-xs text-black dark:text-gray">Indicações</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#29F3DF]"></div>
        <span className="text-xs text-black dark:text-gray">Oportunidades</span>
      </div>
    </div>
  )

  return (
    <div className="bg-transparent rounded-lg">
      {/* Header com seletores de período */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center justify-center bg-white dark:bg-[#190d26] rounded-lg p-1 w-full border border-gray-200 dark:border-tertiary-purple">
          {['Semana', 'Mês', 'Ano'].map(period => (
            <button
              key={period}
              className={`flex-1 px-1 flex justify-center items-center rounded-lg transition-all duration-200 ${
                selectedPeriod === period 
                  ? 'bg-[#4A04A5] shadow-md' 
                  : 'hover:bg-[#4A04A5]/10'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              <div className="w-24 h-6 flex items-center justify-center">
                <span
                  className={`text-xs font-medium text-center transition-colors duration-200 ${
                    selectedPeriod === period 
                      ? 'text-white' 
                      : 'text-black dark:text-white'
                  }`}
                >
                  {period}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área do gráfico */}
      <div className="relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A04A5]"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-16 h-16 mb-4 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#4A04A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-black dark:text-gray text-center">
              Nenhum dado disponível para este período
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 10,
                  left: 10,
                  bottom: 20,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-tertiary-purple/20" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  className="dark:fill-gray"
                />
                <YAxis 
                  hide
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74, 4, 165, 0.05)' }} />
                <Bar 
                  dataKey="indications" 
                  fill="#4A04A5"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="opportunities" 
                  fill="#29F3DF"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legenda customizada */}
      {!isLoading && chartData.length > 0 && <CustomLegend />}

      {/* Informações adicionais */}
      {!isLoading && chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-black dark:text-gray mb-1">Total de Indicações</p>
            <p className="text-lg font-bold text-[#4A04A5]">
              {chartData.reduce((sum, item) => sum + item.indications, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-black dark:text-gray mb-1">Total de Oportunidades</p>
            <p className="text-lg font-bold text-[#29F3DF]">
              {chartData.reduce((sum, item) => sum + item.opportunities, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndicationsChart

