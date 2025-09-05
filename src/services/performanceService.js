/**
 * Performance Metrics Service
 * Calculates various architectural performance metrics for generated layouts
 */

export class PerformanceMetricsCalculator {
  /**
   * Calculate circulation efficiency based on layout geometry
   * @param {Object} layoutData - Layout data with rooms and circulation paths
   * @returns {number} Efficiency score (0-100)
   */
  static calculateCirculationEfficiency(layoutData) {
    const { rooms, circulation } = layoutData
    
    if (!rooms || !circulation || rooms.length === 0) {
      return 0
    }

    // Calculate total circulation area
    const totalCirculationArea = circulation.reduce((total, path) => {
      const fromRoom = rooms.find(r => r.id === path.from)
      const toRoom = rooms.find(r => r.id === path.to)
      
      if (!fromRoom || !toRoom) return total
      
      // Estimate circulation path length using room positions
      const distance = Math.sqrt(
        Math.pow(toRoom.x - fromRoom.x, 2) + 
        Math.pow(toRoom.y - fromRoom.y, 2)
      )
      
      return total + (distance * path.width)
    }, 0)

    // Calculate total usable area
    const totalUsableArea = rooms.reduce((total, room) => total + room.area, 0)
    
    // Calculate efficiency ratio (lower circulation to usable area is better)
    const circulationRatio = totalCirculationArea / totalUsableArea
    
    // Convert to efficiency score (inverted and scaled)
    const efficiency = Math.max(0, Math.min(100, 100 - (circulationRatio * 50)))
    
    return Math.round(efficiency)
  }

  /**
   * Calculate daylight hours based on room positioning and orientation
   * @param {Object} layoutData - Layout data with rooms
   * @param {Object} buildingOrientation - Building orientation settings
   * @returns {number} Average daylight hours per day
   */
  static calculateDaylightHours(layoutData, buildingOrientation = { facing: 'south' }) {
    const { rooms } = layoutData
    
    if (!rooms || rooms.length === 0) {
      return 0
    }

    // Calculate building bounds
    const bounds = this.calculateBuildingBounds(rooms)
    const buildingWidth = bounds.maxX - bounds.minX
    const buildingHeight = bounds.maxY - bounds.minY
    
    let totalDaylightScore = 0
    
    rooms.forEach(room => {
      let roomDaylightScore = 0
      
      // Calculate distance from exterior walls (simplified)
      const distanceFromNorth = room.y - bounds.minY
      const distanceFromSouth = bounds.maxY - (room.y + room.height)
      const distanceFromEast = bounds.maxX - (room.x + room.width)
      const distanceFromWest = room.x - bounds.minX
      
      // Score based on proximity to exterior walls
      const proximityScores = {
        north: Math.max(0, 1 - (distanceFromNorth / buildingHeight)),
        south: Math.max(0, 1 - (distanceFromSouth / buildingHeight)),
        east: Math.max(0, 1 - (distanceFromEast / buildingWidth)),
        west: Math.max(0, 1 - (distanceFromWest / buildingWidth))
      }
      
      // Weight scores based on sun exposure (south-facing gets more daylight)
      const orientationWeights = {
        north: 0.3,
        south: 1.0,
        east: 0.7,
        west: 0.7
      }
      
      roomDaylightScore = Object.keys(proximityScores).reduce((score, direction) => {
        return score + (proximityScores[direction] * orientationWeights[direction])
      }, 0)
      
      // Normalize by room area (larger rooms get proportionally more weight)
      totalDaylightScore += roomDaylightScore * (room.area / 1000) // normalize by 1000 sqft
    })
    
    // Convert to hours (scale 0-12 hours based on score)
    const averageScore = totalDaylightScore / rooms.length
    const daylightHours = Math.max(3, Math.min(12, averageScore * 8 + 4))
    
    return Math.round(daylightHours * 10) / 10 // Round to 1 decimal
  }

  /**
   * Calculate energy efficiency based on layout compactness and orientation
   * @param {Object} layoutData - Layout data with rooms
   * @returns {number} Energy efficiency score (0-100)
   */
  static calculateEnergyEfficiency(layoutData) {
    const { rooms } = layoutData
    
    if (!rooms || rooms.length === 0) {
      return 0
    }

    // Calculate building compactness (surface area to volume ratio)
    const bounds = this.calculateBuildingBounds(rooms)
    const buildingArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)
    const totalRoomArea = rooms.reduce((total, room) => total + room.area, 0)
    
    // Compactness ratio (higher is better for energy efficiency)
    const compactness = totalRoomArea / buildingArea
    
    // Calculate perimeter to area ratio (lower is better)
    const perimeter = 2 * ((bounds.maxX - bounds.minX) + (bounds.maxY - bounds.minY))
    const perimeterToAreaRatio = perimeter / Math.sqrt(buildingArea)
    
    // Calculate room adjacency efficiency (rooms sharing walls save energy)
    const adjacencyScore = this.calculateAdjacencyScore(rooms)
    
    // Combine factors into efficiency score
    const compactnessScore = Math.min(100, compactness * 100)
    const perimeterScore = Math.max(0, 100 - (perimeterToAreaRatio * 10))
    const adjacencyEfficiency = adjacencyScore * 20
    
    const totalEfficiency = (compactnessScore * 0.4) + (perimeterScore * 0.3) + (adjacencyEfficiency * 0.3)
    
    return Math.round(totalEfficiency)
  }

  /**
   * Calculate space utilization efficiency
   * @param {Object} layoutData - Layout data with rooms
   * @returns {number} Space utilization score (0-100)
   */
  static calculateSpaceUtilization(layoutData) {
    const { rooms } = layoutData
    
    if (!rooms || rooms.length === 0) {
      return 0
    }

    const bounds = this.calculateBuildingBounds(rooms)
    const totalBuildingArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)
    const totalRoomArea = rooms.reduce((total, room) => total + room.area, 0)
    
    // Calculate utilization ratio
    const utilization = (totalRoomArea / totalBuildingArea) * 100
    
    return Math.round(Math.min(100, utilization))
  }

  /**
   * Calculate accessibility compliance score
   * @param {Object} layoutData - Layout data with rooms and circulation
   * @param {Object} accessibilitySettings - Accessibility requirements
   * @returns {number} Accessibility score (0-100)
   */
  static calculateAccessibilityScore(layoutData, accessibilitySettings = {}) {
    const { rooms, circulation } = layoutData
    const minCorridorWidth = accessibilitySettings.minCorridorWidth || 4 // feet
    const minDoorWidth = accessibilitySettings.minDoorWidth || 3 // feet
    
    if (!rooms || !circulation) {
      return 0
    }

    let accessibilityIssues = 0
    let totalChecks = 0
    
    // Check corridor widths
    circulation.forEach(path => {
      totalChecks++
      if (path.width < minCorridorWidth) {
        accessibilityIssues++
      }
    })
    
    // Check room accessibility (simplified - assumes all rooms need to be accessible)
    rooms.forEach(room => {
      totalChecks++
      // Check if room has adequate access (simplified check)
      const hasAdequateAccess = circulation.some(path => 
        (path.from === room.id || path.to === room.id) && path.width >= minCorridorWidth
      )
      
      if (!hasAdequateAccess) {
        accessibilityIssues++
      }
    })
    
    // Calculate score
    const score = totalChecks > 0 ? ((totalChecks - accessibilityIssues) / totalChecks) * 100 : 100
    
    return Math.round(score)
  }

  /**
   * Calculate comprehensive performance metrics for a layout
   * @param {Object} layoutData - Layout data with rooms and circulation
   * @param {Object} options - Additional options for calculations
   * @returns {Object} Complete performance metrics
   */
  static calculateAllMetrics(layoutData, options = {}) {
    return {
      circulationEfficiency: this.calculateCirculationEfficiency(layoutData),
      daylightHours: this.calculateDaylightHours(layoutData, options.buildingOrientation),
      energyEfficiency: this.calculateEnergyEfficiency(layoutData),
      spaceUtilization: this.calculateSpaceUtilization(layoutData),
      accessibilityScore: this.calculateAccessibilityScore(layoutData, options.accessibility),
      
      // Additional derived metrics
      overallScore: 0, // Will be calculated below
      recommendations: this.generateRecommendations(layoutData)
    }
  }

  /**
   * Generate recommendations based on performance analysis
   * @param {Object} layoutData - Layout data
   * @returns {Array} Array of recommendation objects
   */
  static generateRecommendations(layoutData) {
    const recommendations = []
    const metrics = this.calculateAllMetrics(layoutData)
    
    if (metrics.circulationEfficiency < 70) {
      recommendations.push({
        type: 'circulation',
        priority: 'high',
        message: 'Consider reducing circulation paths or optimizing room adjacencies to improve efficiency.',
        impact: 'Reduces wasted space and improves flow'
      })
    }
    
    if (metrics.daylightHours < 6) {
      recommendations.push({
        type: 'daylight',
        priority: 'medium',
        message: 'Position more rooms near exterior walls to increase natural light exposure.',
        impact: 'Improves occupant wellbeing and reduces lighting costs'
      })
    }
    
    if (metrics.energyEfficiency < 60) {
      recommendations.push({
        type: 'energy',
        priority: 'high',
        message: 'Optimize building shape for better energy performance. Consider more compact design.',
        impact: 'Reduces heating and cooling costs'
      })
    }
    
    if (metrics.accessibilityScore < 90) {
      recommendations.push({
        type: 'accessibility',
        priority: 'critical',
        message: 'Ensure all circulation paths meet minimum width requirements for accessibility.',
        impact: 'Required for code compliance and universal access'
      })
    }
    
    return recommendations
  }

  // Helper methods
  
  static calculateBuildingBounds(rooms) {
    if (!rooms || rooms.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    }
    
    return rooms.reduce((bounds, room) => ({
      minX: Math.min(bounds.minX, room.x),
      maxX: Math.max(bounds.maxX, room.x + room.width),
      minY: Math.min(bounds.minY, room.y),
      maxY: Math.max(bounds.maxY, room.y + room.height)
    }), {
      minX: rooms[0].x,
      maxX: rooms[0].x + rooms[0].width,
      minY: rooms[0].y,
      maxY: rooms[0].y + rooms[0].height
    })
  }
  
  static calculateAdjacencyScore(rooms) {
    let adjacentPairs = 0
    let totalPossiblePairs = 0
    
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        totalPossiblePairs++
        
        const room1 = rooms[i]
        const room2 = rooms[j]
        
        // Check if rooms are adjacent (share a wall)
        const horizontallyAdjacent = (
          (room1.x + room1.width === room2.x || room2.x + room2.width === room1.x) &&
          !(room1.y + room1.height <= room2.y || room2.y + room2.height <= room1.y)
        )
        
        const verticallyAdjacent = (
          (room1.y + room1.height === room2.y || room2.y + room2.height === room1.y) &&
          !(room1.x + room1.width <= room2.x || room2.x + room2.width <= room1.x)
        )
        
        if (horizontallyAdjacent || verticallyAdjacent) {
          adjacentPairs++
        }
      }
    }
    
    return totalPossiblePairs > 0 ? adjacentPairs / totalPossiblePairs : 0
  }
}

// Export convenience functions
export const calculatePerformanceMetrics = (layoutData, options) => 
  PerformanceMetricsCalculator.calculateAllMetrics(layoutData, options)

export const generateLayoutRecommendations = (layoutData) => 
  PerformanceMetricsCalculator.generateRecommendations(layoutData)
