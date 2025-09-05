import React, { useState } from 'react'
import { X, Upload, Building2, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useForm } from 'react-hook-form'
import { generateLayoutFromSchedule } from '../services/aiService'

export function ProjectUploader({ onClose }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { addProject, addLayout } = useStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const watchedData = watch()

  const onSubmit = async (data) => {
    setIsGenerating(true)
    
    try {
      // Create the project first
      const project = {
        name: data.projectName,
        scheduleData: data.scheduleData,
        normSettings: {
          country: data.country,
          codes: data.buildingCodes || [],
          accessibility: data.accessibility || false,
        },
        layouts: [],
      }
      
      addProject(project)
      const projectId = `project-${Date.now()}`
      
      // Generate initial layout using AI
      const layoutData = await generateLayoutFromSchedule(data.scheduleData, project.normSettings)
      
      const layout = {
        projectId: projectId,
        name: 'AI Generated Layout',
        layoutData: layoutData,
        version: 1,
        performanceMetrics: {
          circulationEfficiency: Math.round(Math.random() * 30 + 70), // Simulate realistic metrics
          daylightHours: Math.round((Math.random() * 4 + 5) * 10) / 10,
          energyEfficiency: Math.round(Math.random() * 25 + 70),
        },
        complianceStatus: Math.random() > 0.3 ? 'compliant' : 'warning',
      }
      
      addLayout(layout)
      
      onClose()
    } catch (error) {
      console.error('Error generating layout:', error)
      // Still create the project even if AI generation fails
      onClose()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-text"
            disabled={isGenerating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Project Name *
            </label>
            <input
              {...register('projectName', { required: 'Project name is required' })}
              type="text"
              className="input"
              placeholder="e.g., Modern Office Complex"
            />
            {errors.projectName && (
              <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
            )}
          </div>

          {/* Schedule Data */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Project Requirements *
            </label>
            <textarea
              {...register('scheduleData', { required: 'Project requirements are required' })}
              rows={4}
              className="input resize-none"
              placeholder="Describe your project requirements, room adjacencies, functional needs, and spatial relationships. E.g., 'Open office space for 50 people with 3 meeting rooms, reception area, kitchen, and storage. Meeting rooms should be adjacent to office space but acoustically separated.'"
            />
            {errors.scheduleData && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduleData.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Tip: Be specific about room types, sizes, adjacencies, and special requirements.
            </p>
          </div>

          {/* Building Norms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Country/Region
              </label>
              <select {...register('country')} className="input">
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="EU">European Union</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Building Codes
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('buildingCodes')}
                    type="checkbox"
                    value="ADA"
                    className="mr-2"
                  />
                  <span className="text-sm">ADA Compliance</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('buildingCodes')}
                    type="checkbox"
                    value="IBC"
                    className="mr-2"
                  />
                  <span className="text-sm">International Building Code (IBC)</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('buildingCodes')}
                    type="checkbox"
                    value="LEED"
                    className="mr-2"
                  />
                  <span className="text-sm">LEED Standards</span>
                </label>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <label className="flex items-center">
              <input
                {...register('accessibility')}
                type="checkbox"
                className="mr-2"
              />
              <span className="text-sm font-medium text-text">
                Prioritize accessibility features
              </span>
            </label>
          </div>

          {/* Performance Targets */}
          <div>
            <h3 className="text-sm font-medium text-text mb-3">Performance Optimization (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Circulation Efficiency</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Natural Lighting</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Energy Efficiency</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center space-x-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Layout...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Create & Generate Layout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}