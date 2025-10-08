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
  const [data, setData] = useState<ChartData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Mês')
  const [isLoading, setIsLoading] = useState(true)

  // Mock user data - substitua pela implementação real do contexto de auth
  const userData = {
    uid: "mock-user-id"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Mock data - substitua pela implementação real da API
        const mockData: ChartData = {
          week: [
            { name: 'Dom', value: 0, count: 0, formattedValue: 'R$ 0,00' },
            { name: 'Seg', value: 150, count: 2, formattedValue: 'R$ 150,00' },
            { name: 'Ter', value: 300, count: 4, formattedValue: 'R$ 300,00' },
            { name: 'Qua', value: 200, count: 3, formattedValue: 'R$ 200,00' },
            { name: 'Qui', value: 400, count: 5, formattedValue: 'R$ 400,00' },
            { name: 'Sex', value: 250, count: 3, formattedValue: 'R$ 250,00' },
            { name: 'Sáb', value: 0, count: 0, formattedValue: 'R$ 0,00' }
          ],
          month: [
            { name: 'Semana 1', value: 1200, count: 15, formattedValue: 'R$ 1.200,00' },
            { name: 'Semana 2', value: 800, count: 10, formattedValue: 'R$ 800,00' },
            { name: 'Semana 3', value: 1500, count: 20, formattedValue: 'R$ 1.500,00' },
            { name: 'Semana 4', value: 0, count: 0, formattedValue: 'R$ 0,00' },
            { name: 'Semana 5', value: 0, count: 0, formattedValue: 'R$ 0,00' }
          ],
          year: [
            { name: 'Jan', value: 5000, count: 50, formattedValue: 'R$ 5.000,00' },
            { name: 'Fev', value: 4500, count: 45, formattedValue: 'R$ 4.500,00' },
            { name: 'Mar', value: 6000, count: 60, formattedValue: 'R$ 6.000,00' },
            { name: 'Abr', value: 5500, count: 55, formattedValue: 'R$ 5.500,00' },
            { name: 'Mai', value: 7000, count: 70, formattedValue: 'R$ 7.000,00' },
            { name: 'Jun', value: 6500, count: 65, formattedValue: 'R$ 6.500,00' },
            { name: 'Jul', value: 8000, count: 80, formattedValue: 'R$ 8.000,00' },
            { name: 'Ago', value: 7500, count: 75, formattedValue: 'R$ 7.500,00' },
            { name: 'Set', value: 0, count: 0, formattedValue: 'R$ 0,00' },
            { name: 'Out', value: 0, count: 0, formattedValue: 'R$ 0,00' },
            { name: 'Nov', value: 0, count: 0, formattedValue: 'R$ 0,00' },
            { name: 'Dez', value: 0, count: 0, formattedValue: 'R$ 0,00' }
          ]
        }
        setData(mockData)
      } catch (error) {
        console.error('error', error)
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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-[#4A04A5]">{label}</p>
          <p className="text-sm text-gray-600">
            Valor: <span className="font-bold">{data.formattedValue}</span>
          </p>
          <p className="text-sm text-gray-600">
            Indicações: <span className="font-bold">{data.count}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Função para renderizar barras customizadas
  const renderCustomBar = (entry: any, index: number) => {
    const isActive = entry.value > 0
    const colors = isActive 
      ? ['#4E00A7', '#6800E0'] 
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
        <div className="flex items-center justify-center bg-[#f4f0ff] rounded-lg p-1 w-full">
          {['Semana', 'Mês', 'Ano'].map(period => (
            <button
              key={period}
              className={`flex-1 px-1 flex justify-center items-center rounded-lg transition-all duration-200 ${
                selectedPeriod === period ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-100'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              <div className="w-24 h-6 flex items-center justify-center">
                <span
                  className={`text-xs font-normal text-center transition-colors duration-200 ${
                    selectedPeriod === period ? 'text-white' : 'text-black'
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
          <p className="text-xs text-gray-500">
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
