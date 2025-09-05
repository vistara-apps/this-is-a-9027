import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Settings, 
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sun,
  Zap,
  Loader2
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { ParameterSlider } from '../components/ParameterSlider'
import { generateLayoutFromSchedule, optimizeLayoutParameters } from '../services/aiService'

export function ProjectPage() {
  const { projectId } = useParams()
  const { getProject, getProjectLayouts, addLayout, updateLayout } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [parameters, setParameters] = useState({
    roomSize: 1.0,
    circulationWidth: 1.0,
    daylight: 1.0,
    efficiency: 1.0,
  })

  const project = getProject(projectId)
  const layouts = getProjectLayouts(projectId)

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Project Not Found</h1>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const handleGenerateVariation = async () => {
    if (!selectedLayout) return
    
    setIsGenerating(true)
    try {
      const optimizedLayoutData = await optimizeLayoutParameters(
        selectedLayout.layoutData,
        parameters
      )
      
      const newLayout = {
        projectId: projectId,
        name: `${selectedLayout.name} - Variation ${layouts.length + 1}`,
        layoutData: optimizedLayoutData,
        version: selectedLayout.version + 1,
        performanceMetrics: {
          circulationEfficiency: Math.round(selectedLayout.performanceMetrics.circulationEfficiency * (0.9 + Math.random() * 0.2)),
          daylightHours: Math.round((selectedLayout.performanceMetrics.daylightHours * (0.9 + Math.random() * 0.2)) * 10) / 10,
          energyEfficiency: Math.round(selectedLayout.performanceMetrics.energyEfficiency * (0.9 + Math.random() * 0.2)),
        },
        complianceStatus: Math.random() > 0.3 ? 'compliant' : 'warning',
      }
      
      addLayout(newLayout)
    } catch (error) {
      console.error('Error generating variation:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateNewLayout = async () => {
    setIsGenerating(true)
    try {
      const layoutData = await generateLayoutFromSchedule(
        project.scheduleData,
        project.normSettings
      )
      
      const newLayout = {
        projectId: projectId,
        name: `Layout Option ${layouts.length + 1}`,
        layoutData: layoutData,
        version: 1,
        performanceMetrics: {
          circulationEfficiency: Math.round(Math.random() * 30 + 70),
          daylightHours: Math.round((Math.random() * 4 + 5) * 10) / 10,
          energyEfficiency: Math.round(Math.random() * 25 + 70),
        },
        complianceStatus: Math.random() > 0.3 ? 'compliant' : 'warning',
      }
      
      addLayout(newLayout)
    } catch (error) {
      console.error('Error generating new layout:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4 text-gray-500 hover:text-text">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-text">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.scheduleData}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleGenerateNewLayout}
              disabled={isGenerating}
              className="btn-primary flex items-center space-x-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Generate Layout</span>
            </button>
            <button className="btn-secondary">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Layout List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text">Generated Layouts</h2>
              <span className="text-sm text-gray-500">{layouts.length} layout{layouts.length !== 1 ? 's' : ''}</span>
            </div>

            {layouts.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-text mb-2">No layouts yet</h3>
                <p className="text-gray-500 mb-6">Generate your first architectural layout using AI</p>
                <button
                  onClick={handleGenerateNewLayout}
                  disabled={isGenerating}
                  className="btn-primary"
                >
                  {isGenerating ? 'Generating...' : 'Generate First Layout'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`card cursor-pointer transition-all duration-150 ${
                      selectedLayout?.id === layout.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedLayout(layout)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-text mb-1">{layout.name}</h3>
                        <div className="flex items-center space-x-2">
                          {layout.complianceStatus === 'compliant' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {layout.complianceStatus === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          {layout.complianceStatus === 'non-compliant' && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm text-gray-600 capitalize">
                            {layout.complianceStatus.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/layout/${layout.id}`}
                          className="p-2 text-gray-500 hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-gray-500 hover:text-primary">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-gray-500">Circulation</div>
                          <div className="font-medium">{layout.performanceMetrics.circulationEfficiency}%</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <div>
                          <div className="text-gray-500">Daylight</div>
                          <div className="font-medium">{layout.performanceMetrics.daylightHours}h</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-gray-500">Energy</div>
                          <div className="font-medium">{layout.performanceMetrics.energyEfficiency}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Simple layout preview */}
                    <div className="mt-4 h-32 bg-gray-50 rounded border relative overflow-hidden">
                      <div className="absolute inset-0 p-2">
                        {layout.layoutData.rooms?.slice(0, 4).map((room, index) => (
                          <div
                            key={room.id}
                            className="absolute bg-primary/20 border border-primary/40 rounded text-xs p-1"
                            style={{
                              left: `${(room.x / 1000) * 100}%`,
                              top: `${(room.y / 800) * 100}%`,
                              width: `${Math.min((room.width / 1000) * 100, 25)}%`,
                              height: `${Math.min((room.height / 800) * 100, 25)}%`,
                            }}
                          >
                            <span className="text-primary font-medium truncate block">
                              {room.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parameter Controls */}
          <div>
            <h2 className="text-xl font-semibold text-text mb-6">Design Parameters</h2>
            
            {selectedLayout ? (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-medium text-text mb-4">Optimize Layout</h3>
                  <div className="space-y-4">
                    <ParameterSlider
                      label="Room Size"
                      value={parameters.roomSize}
                      onChange={(value) => setParameters(prev => ({ ...prev, roomSize: value }))}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                    />
                    <ParameterSlider
                      label="Circulation Width"
                      value={parameters.circulationWidth}
                      onChange={(value) => setParameters(prev => ({ ...prev, circulationWidth: value }))}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                    />
                    <ParameterSlider
                      label="Daylight Priority"
                      value={parameters.daylight}
                      onChange={(value) => setParameters(prev => ({ ...prev, daylight: value }))}
                      min={0.0}
                      max={2.0}
                      step={0.1}
                    />
                    <ParameterSlider
                      label="Efficiency Priority"
                      value={parameters.efficiency}
                      onChange={(value) => setParameters(prev => ({ ...prev, efficiency: value }))}
                      min={0.0}
                      max={2.0}
                      step={0.1}
                    />
                  </div>
                  
                  <button
                    onClick={handleGenerateVariation}
                    disabled={isGenerating}
                    className="w-full mt-6 btn-primary flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Generate Variation'}</span>
                  </button>
                </div>

                <div className="card">
                  <h3 className="font-medium text-text mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Circulation Efficiency</span>
                      <span className="font-medium">{selectedLayout.performanceMetrics.circulationEfficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Daylight Hours</span>
                      <span className="font-medium">{selectedLayout.performanceMetrics.daylightHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Energy Efficiency</span>
                      <span className="font-medium">{selectedLayout.performanceMetrics.energyEfficiency}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-500">Select a layout to adjust parameters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}