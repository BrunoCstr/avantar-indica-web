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
    cyan: "from-[#29F3DF] to-[#0EC8B5]/70",
    purple: "from-[#4A04A5] to-[#C352F2]",
    orange: "from-[#F28907] to-[#F28907]/70",
    pink: "from-[#C352F2] to-[#C352F2]/70",
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02] group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-bold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-xs mb-1 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-[#4A04A5]">{value}</p>
    </div>
  )
}
