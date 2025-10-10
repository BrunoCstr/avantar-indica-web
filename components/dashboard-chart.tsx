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
  Cell
} from 'recharts'
import { useAuth } from '@/context/Auth'
import { getCommissionsByPeriod } from '@/services/wallet/dashboard'

interface ChartDataItem {
  name: string
  value: number
  count: number
  formattedValue: string
}

interface ChartData {
  week: ChartDataItem[]
  month: ChartDataItem[]
  year: ChartDataItem[]
}

const DashboardChart = () => {
  const { userData } = useAuth()
  const [data, setData] = useState<ChartData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Mês')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        // Buscar dados reais do Firestore
        const commissionsData = await getCommissionsByPeriod(userData.uid)
        
        // Converter os dados para o formato do gráfico (label -> name)
        const chartData: ChartData = {
          week: commissionsData.week.map(item => ({
            name: item.label,
            value: item.value,
            count: item.count,
            formattedValue: item.formattedValue,
          })),
          month: commissionsData.month.map(item => ({
            name: item.label,
            value: item.value,
            count: item.count,
            formattedValue: item.formattedValue,
          })),
          year: commissionsData.year.map(item => ({
            name: item.label,
            value: item.value,
            count: item.count,
            formattedValue: item.formattedValue,
          })),
        }
        
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
  const getChartData = (): ChartDataItem[] => {
    if (!data) return []

    let periodData: ChartDataItem[] = []

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
        periodData = data.month || []
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
        <div className="bg-white dark:bg-[#190d26] rounded-lg shadow-lg border border-gray dark:border-tertiary-purple overflow-hidden">
          {/* Header com gradiente roxo claro */}
          <div className="bg-gradient-to-r from-primary-purple/10 to-secondary-purple/10 dark:from-primary-purple/20 dark:to-secondary-purple/20 p-3">
            <p className="font-semibold text-black dark:text-blue">{label}</p>
          </div>
          {/* Conteúdo */}
          <div className="p-3">
            <p className="text-sm text-black dark:text-gray">
              Valor: <span className="font-bold">{data.formattedValue}</span>
            </p>
            <p className="text-sm text-black dark:text-gray">
              Indicações: <span className="font-bold">{data.count}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Função para renderizar barras customizadas
  const renderCustomBar = (entry: any, index: number) => {
    const isActive = entry.value > 0
    const colors = isActive 
      ? ['#4A04A5', '#6800E0'] // primary-purple to fourth-purple
      : ['#E5E7EB', '#E5E7EB']
    
    return (
      <defs>
        <linearGradient id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
    )
  }

  return (
    <div className="bg-transparent rounded-lg shadow-sm">
      {/* Header com seletores de período */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center justify-center bg-white dark:bg-[#190d26] rounded-lg p-1 w-full border border-gray dark:border-tertiary-purple">
          {['Semana', 'Mês', 'Ano'].map(period => (
            <button
              key={period}
              className={`flex-1 px-1 flex justify-center items-center rounded-lg transition-all duration ${
                selectedPeriod === period ? 'bg-orange shadow-md' : 'hover:bg-second-orange/20 dark:hover:bg-second-orange/10'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              <div className="w-24 h-6 flex items-center justify-center">
                <span
                  className={`text-xs font-normal text-center transition-colors duration ${
                    selectedPeriod === period ? 'text-white' : 'text-black dark:text-white'
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple dark:border-blue"></div>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  hide
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 0 ? `url(#colorGradient${index})` : '#E5E7EB'} 
                    />
                  ))}
                </Bar>
                <defs>
                  {chartData.map((entry, index) => renderCustomBar(entry, index))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      {!isLoading && chartData.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-black dark:text-gray">
            Total: {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
        </div>
      )}
    </div>
  )
}

export default DashboardChart
