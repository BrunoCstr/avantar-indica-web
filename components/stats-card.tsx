import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: "cyan" | "purple" | "orange" | "pink"
}

export function StatsCard({ title, value, icon: Icon, trend, color = "cyan" }: StatsCardProps) {
  const colorClasses = {
    cyan: "from-blue to-dark-blue",
    purple: "from-primary-purple to-pink",
    orange: "from-second-orange to-orange",
    pink: "from-pink to-secondary-lillac",
  }

  return (
    <div className="bg-white dark:bg-[#190d26] rounded-xl shadow-sm border border-gray-100 dark:border-tertiary-purple hover:shadow-md transition-all hover:scale-[1.02] group overflow-hidden">
      {/* Header com gradiente roxo claro */}
      <div className="bg-gradient-to-r from-avantar-primary/10 to-avantar-secondary/10 dark:from-avantar-primary/20 dark:to-avantar-secondary/20 p-3">
        <div className="flex items-start justify-between">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <span className={`text-xs font-bold ${trend.isPositive ? "text-green" : "text-red"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </div>
      
      {/* Conteúdo do card */}
      <div className="p-4">
        <h3 className="text-white dark:text-gray-300 text-xs mb-1 font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white dark:text-blue">{value}</p>
      </div>
    </div>
  )
}
