import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { ComplianceStatusBadge } from '../components/ComplianceStatusBadge'
import { MetricDisplay } from '../components/MetricDisplay'

export function LayoutViewer() {
  const { layoutId } = useParams()
  const { getLayout, getProject } = useStore()
  const [viewMode, setViewMode] = useState('2d') // '2d' or '3d'
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedRoom, setSelectedRoom] = useState(null)

  const layout = getLayout(layoutId)
  const project = layout ? getProject(layout.projectId) : null

  if (!layout || !project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Layout Not Found</h1>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'non-compliant':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/project/${layout.projectId}`}
              className="text-gray-500 hover:text-text"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-text">{layout.name}</h1>
              <p className="text-sm text-gray-600">{project.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(layout.complianceStatus)}
              <ComplianceStatusBadge status={layout.complianceStatus} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Controls */}
            <div className="hidden lg:flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === '2d' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-text'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === '3d' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-text'
                }`}
              >
                3D
              </button>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-500 hover:text-text"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-500 hover:text-text"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2 text-gray-500 hover:text-text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button className="btn-secondary p-2">
                <Edit className="w-4 h-4" />
              </button>
              <button className="btn-secondary p-2">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Viewer */}
        <div className="flex-1 relative bg-white">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="w-full h-full"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Floor Plan Canvas */}
              <svg 
                className="w-full h-full" 
                viewBox="0 0 1200 800"
                style={{ minWidth: '1200px', minHeight: '800px' }}
              >
                {/* Grid Background */}
                <defs>
                  <pattern 
                    id="grid" 
                    width="50" 
                    height="50" 
                    patternUnits="userSpaceOnUse"
                  >
                    <path 
                      d="M 50 0 L 0 0 0 50" 
                      fill="none" 
                      stroke="#f3f4f6" 
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Circulation Paths */}
                {layout.layoutData.circulation?.map((path, index) => {
                  const fromRoom = layout.layoutData.rooms.find(r => r.id === path.from)
                  const toRoom = layout.layoutData.rooms.find(r => r.id === path.to)
                  
                  if (!fromRoom || !toRoom) return null
                  
                  const fromCenter = {
                    x: fromRoom.x + fromRoom.width / 2,
                    y: fromRoom.y + fromRoom.height / 2
                  }
                  const toCenter = {
                    x: toRoom.x + toRoom.width / 2,
                    y: toRoom.y + toRoom.height / 2
                  }
                  
                  return (
                    <line
                      key={`circulation-${index}`}
                      x1={fromCenter.x}
                      y1={fromCenter.y}
                      x2={toCenter.x}
                      y2={toCenter.y}
                      stroke="hsl(210, 90%, 60%)"
                      strokeWidth={path.width * 2}
                      strokeOpacity="0.3"
                      strokeDasharray="5,5"
                    />
                  )
                })}
                
                {/* Rooms */}
                {layout.layoutData.rooms?.map((room) => (
                  <g key={room.id}>
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      fill={selectedRoom?.id === room.id ? "hsl(210, 90%, 95%)" : "hsl(210, 90%, 98%)"}
                      stroke={selectedRoom?.id === room.id ? "hsl(210, 90%, 30%)" : "hsl(210, 30%, 85%)"}
                      strokeWidth={selectedRoom?.id === room.id ? "3" : "2"}
                      className="cursor-pointer transition-colors duration-150"
                      onClick={() => setSelectedRoom(room)}
                    />
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 - 10}
                      textAnchor="middle"
                      className="fill-current text-text font-medium pointer-events-none"
                      fontSize="14"
                    >
                      {room.name}
                    </text>
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 + 6}
                      textAnchor="middle"
                      className="fill-current text-gray-500 pointer-events-none"
                      fontSize="12"
                    >
                      {room.area} sq ft
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
          
          {/* Floating Controls */}
          <div className="absolute bottom-4 left-4 bg-surface rounded-lg shadow-card p-2 flex items-center space-x-2">
            <Move className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Click and drag to pan</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-surface border-l border-border flex flex-col">
          {/* Performance Metrics */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-text mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <MetricDisplay
                label="Circulation Efficiency"
                value={layout.performanceMetrics.circulationEfficiency}
                unit="%"
                variant="chart"
              />
              <MetricDisplay
                label="Daylight Hours"
                value={layout.performanceMetrics.daylightHours}
                unit="h"
                variant="number"
              />
              <MetricDisplay
                label="Energy Efficiency"
                value={layout.performanceMetrics.energyEfficiency}
                unit="%"
                variant="chart"
              />
            </div>
          </div>

          {/* Room Details */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-text mb-4">Room Information</h3>
            {selectedRoom ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-text">{selectedRoom.name}</h4>
                  <p className="text-sm text-gray-600">Area: {selectedRoom.area} sq ft</p>
                  <p className="text-sm text-gray-600">
                    Dimensions: {selectedRoom.width}' × {selectedRoom.height}'
                  </p>
                </div>
                <div className="pt-3 border-t border-border">
                  <h5 className="text-sm font-medium text-text mb-2">Adjacencies</h5>
                  {layout.layoutData.circulation
                    ?.filter(path => path.from === selectedRoom.id || path.to === selectedRoom.id)
                    .map((path, index) => {
                      const connectedRoomId = path.from === selectedRoom.id ? path.to : path.from
                      const connectedRoom = layout.layoutData.rooms.find(r => r.id === connectedRoomId)
                      return (
                        <div key={index} className="text-sm text-gray-600">
                          → {connectedRoom?.name} ({path.width}' wide)
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Click on a room to see details</p>
            )}
          </div>

          {/* Compliance Status */}
          <div className="p-6">
            <h3 className="font-semibold text-text mb-4">Compliance Status</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(layout.complianceStatus)}
                <div>
                  <div className="font-medium text-text capitalize">
                    {layout.complianceStatus.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {layout.complianceStatus === 'compliant' && 'All requirements met'}
                    {layout.complianceStatus === 'warning' && 'Minor issues detected'}
                    {layout.complianceStatus === 'non-compliant' && 'Requires attention'}
                  </div>
                </div>
              </div>
              
              {layout.complianceStatus !== 'compliant' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Issues Found:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Corridor width below ADA minimum in 2 locations</li>
                    <li>• Office space below recommended minimum area</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}