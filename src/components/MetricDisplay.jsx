import React from 'react'

export function MetricDisplay({ label, value, unit = '', variant = 'number' }) {
  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (variant === 'chart') {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-text">{label}</span>
          <span className="text-sm text-gray-600">{value}{unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(value)}`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-text">{label}</span>
      <span className="text-lg font-semibold text-text">
        {value}{unit}
      </span>
    </div>
  )
}