import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export function ComplianceStatusBadge({ status, variant = 'default' }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'compliant':
        return {
          icon: CheckCircle2,
          text: 'Compliant',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          text: 'Warning',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'non-compliant':
        return {
          icon: XCircle,
          text: 'Non-Compliant',
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          icon: AlertTriangle,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  )
}