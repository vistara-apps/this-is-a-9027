import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Calendar, 
  Building2, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { ProjectUploader } from '../components/ProjectUploader'
import { formatDistanceToNow } from 'date-fns'

export function Dashboard() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const { projects, layouts, getProjectLayouts } = useStore()

  const recentLayouts = layouts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  const stats = {
    totalProjects: projects.length,
    totalLayouts: layouts.length,
    avgPerformance: Math.round(
      layouts.reduce((sum, layout) => sum + layout.performanceMetrics.circulationEfficiency, 0) / layouts.length
    ),
    compliantLayouts: layouts.filter(layout => layout.complianceStatus === 'compliant').length,
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Generate optimized architectural layouts with AI
            </p>
          </div>
          <button
            onClick={() => setShowCreateProject(true)}
            className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">Projects</div>
          </div>
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-text">{stats.totalLayouts}</div>
            <div className="text-sm text-gray-600">Layouts</div>
          </div>
          <div className="card text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text">{stats.avgPerformance}%</div>
            <div className="text-sm text-gray-600">Avg Performance</div>
          </div>
          <div className="card text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text">{stats.compliantLayouts}</div>
            <div className="text-sm text-gray-600">Compliant</div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text">Recent Projects</h2>
              <Link to="/projects" className="text-primary hover:text-primary-600 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => {
                const projectLayouts = getProjectLayouts(project.id)
                return (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="card hover:shadow-lg transition-shadow duration-150 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-text mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {project.scheduleData}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                          </span>
                          <span>{projectLayouts.length} layout{projectLayouts.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Layouts */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text">Recent Layouts</h2>
              <Link to="/layouts" className="text-primary hover:text-primary-600 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentLayouts.map((layout) => (
                <Link
                  key={layout.id}
                  to={`/layout/${layout.id}`}
                  className="card hover:shadow-lg transition-shadow duration-150 block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-text mb-1">{layout.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
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
                    <div className="text-right">
                      <div className="text-lg font-semibold text-text">
                        {layout.performanceMetrics.circulationEfficiency}%
                      </div>
                      <div className="text-xs text-gray-500">Efficiency</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-gray-500">Daylight</div>
                      <div className="font-medium">{layout.performanceMetrics.daylightHours}h</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Energy</div>
                      <div className="font-medium">{layout.performanceMetrics.energyEfficiency}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Created</div>
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(layout.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Project Creation Modal */}
        {showCreateProject && (
          <ProjectUploader onClose={() => setShowCreateProject(false)} />
        )}
      </div>
    </div>
  )
}