/**
 * Building Codes Service
 * Handles building code compliance checking and validation
 */

// Building code database (simplified - in production this would be a comprehensive API)
const BUILDING_CODES = {
  US: {
    IBC: { // International Building Code
      name: 'International Building Code',
      version: '2021',
      rules: {
        corridorWidth: {
          minimum: 44, // inches (3.67 feet)
          description: 'Minimum corridor width for egress'
        },
        exitWidth: {
          minimum: 32, // inches
          description: 'Minimum exit door width'
        },
        roomArea: {
          office: { minimum: 80 }, // sq ft
          meeting: { minimum: 120 },
          restroom: { minimum: 30 }
        },
        accessibility: {
          doorWidth: 32, // inches
          corridorWidth: 36, // inches
          turningSpace: 60 // inches diameter
        }
      }
    },
    ADA: { // Americans with Disabilities Act
      name: 'Americans with Disabilities Act',
      version: '2010',
      rules: {
        corridorWidth: {
          minimum: 36, // inches
          description: 'Minimum accessible route width'
        },
        doorWidth: {
          minimum: 32, // inches
          description: 'Minimum clear width for doorways'
        },
        turningSpace: {
          minimum: 60, // inches diameter
          description: 'Wheelchair turning space'
        },
        reachRanges: {
          high: 48, // inches
          low: 15, // inches
          description: 'Accessible reach ranges'
        }
      }
    },
    IRC: { // International Residential Code
      name: 'International Residential Code',
      version: '2021',
      rules: {
        bedroomArea: {
          minimum: 70 // sq ft
        },
        ceilingHeight: {
          minimum: 90 // inches (7.5 feet)
        },
        windowArea: {
          minimum: 0.08 // 8% of floor area
        },
        hallwayWidth: {
          minimum: 36 // inches
        }
      }
    }
  },
  CA: { // Canada
    NBC: { // National Building Code of Canada
      name: 'National Building Code of Canada',
      version: '2020',
      rules: {
        corridorWidth: {
          minimum: 1100, // mm (43.3 inches)
          description: 'Minimum corridor width'
        },
        exitWidth: {
          minimum: 850, // mm (33.5 inches)
          description: 'Minimum exit width'
        }
      }
    }
  }
}

export class BuildingCodesService {
  /**
   * Check layout compliance against specified building codes
   * @param {Object} layoutData - Layout data with rooms and circulation
   * @param {Object} codeSettings - Code settings (country, codes, etc.)
   * @returns {Object} Compliance results
   */
  static async checkCompliance(layoutData, codeSettings) {
    const { country = 'US', codes = ['IBC', 'ADA'], accessibility = true } = codeSettings
    const results = {
      status: 'compliant',
      issues: [],
      warnings: [],
      summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    }

    // Get applicable codes
    const applicableCodes = this.getApplicableCodes(country, codes)
    
    if (applicableCodes.length === 0) {
      results.issues.push({
        type: 'configuration',
        severity: 'error',
        message: `No building codes found for country: ${country}`,
        code: 'CONFIG_ERROR'
      })
      results.status = 'error'
      return results
    }

    // Run compliance checks
    for (const codeData of applicableCodes) {
      await this.runCodeChecks(layoutData, codeData, results)
    }

    // Determine overall status
    if (results.issues.length > 0) {
      const criticalIssues = results.issues.filter(issue => issue.severity === 'critical')
      results.status = criticalIssues.length > 0 ? 'non-compliant' : 'warning'
    }

    // Update summary
    results.summary.totalChecks = results.summary.passed + results.summary.failed + results.summary.warnings
    
    return results
  }

  /**
   * Get applicable building codes for a country and code list
   * @param {string} country - Country code
   * @param {Array} codes - Array of code names
   * @returns {Array} Array of applicable code objects
   */
  static getApplicableCodes(country, codes) {
    const countryData = BUILDING_CODES[country]
    if (!countryData) return []

    return codes
      .filter(codeKey => countryData[codeKey])
      .map(codeKey => ({
        key: codeKey,
        ...countryData[codeKey]
      }))
  }

  /**
   * Run compliance checks for a specific building code
   * @param {Object} layoutData - Layout data
   * @param {Object} codeData - Building code data
   * @param {Object} results - Results object to update
   */
  static async runCodeChecks(layoutData, codeData, results) {
    const { rooms, circulation } = layoutData
    const { key: codeKey, rules } = codeData

    // Check corridor widths
    if (rules.corridorWidth && circulation) {
      circulation.forEach((path, index) => {
        results.summary.totalChecks++
        const pathWidthInches = path.width * 12 // convert feet to inches
        
        if (pathWidthInches < rules.corridorWidth.minimum) {
          results.issues.push({
            type: 'corridor_width',
            severity: 'critical',
            message: `Corridor width ${path.width}' (${pathWidthInches}") is below minimum ${rules.corridorWidth.minimum}" required by ${codeKey}`,
            code: `${codeKey}_CORRIDOR_WIDTH`,
            location: `Path ${index + 1}: ${path.from} → ${path.to}`,
            required: rules.corridorWidth.minimum,
            actual: pathWidthInches,
            unit: 'inches'
          })
          results.summary.failed++
        } else {
          results.summary.passed++
        }
      })
    }

    // Check room areas
    if (rules.roomArea && rooms) {
      rooms.forEach(room => {
        const roomType = this.inferRoomType(room.name)
        const areaRequirement = rules.roomArea[roomType]
        
        if (areaRequirement) {
          results.summary.totalChecks++
          
          if (room.area < areaRequirement.minimum) {
            results.issues.push({
              type: 'room_area',
              severity: 'critical',
              message: `${room.name} area ${room.area} sq ft is below minimum ${areaRequirement.minimum} sq ft required by ${codeKey}`,
              code: `${codeKey}_ROOM_AREA`,
              location: room.name,
              required: areaRequirement.minimum,
              actual: room.area,
              unit: 'sq ft'
            })
            results.summary.failed++
          } else {
            results.summary.passed++
          }
        }
      })
    }

    // Check accessibility requirements
    if (rules.accessibility && rooms) {
      this.checkAccessibilityCompliance(layoutData, rules.accessibility, codeKey, results)
    }

    // Check door widths
    if (rules.doorWidth || rules.exitWidth) {
      this.checkDoorWidths(layoutData, rules, codeKey, results)
    }
  }

  /**
   * Check accessibility compliance
   * @param {Object} layoutData - Layout data
   * @param {Object} accessibilityRules - Accessibility rules
   * @param {string} codeKey - Code identifier
   * @param {Object} results - Results object to update
   */
  static checkAccessibilityCompliance(layoutData, accessibilityRules, codeKey, results) {
    const { rooms, circulation } = layoutData

    // Check accessible routes
    if (accessibilityRules.corridorWidth && circulation) {
      circulation.forEach((path, index) => {
        results.summary.totalChecks++
        const pathWidthInches = path.width * 12
        
        if (pathWidthInches < accessibilityRules.corridorWidth) {
          results.issues.push({
            type: 'accessibility_route',
            severity: 'critical',
            message: `Accessible route width ${path.width}' (${pathWidthInches}") is below minimum ${accessibilityRules.corridorWidth}" required by ${codeKey}`,
            code: `${codeKey}_ACCESSIBLE_ROUTE`,
            location: `Path ${index + 1}: ${path.from} → ${path.to}`,
            required: accessibilityRules.corridorWidth,
            actual: pathWidthInches,
            unit: 'inches'
          })
          results.summary.failed++
        } else {
          results.summary.passed++
        }
      })
    }

    // Check turning spaces (simplified - assumes rooms have adequate turning space if area > threshold)
    if (accessibilityRules.turningSpace && rooms) {
      rooms.forEach(room => {
        results.summary.totalChecks++
        const minTurningArea = Math.pow(accessibilityRules.turningSpace / 12, 2) // convert to sq ft
        
        if (room.area < minTurningArea && this.requiresTurningSpace(room.name)) {
          results.warnings.push({
            type: 'turning_space',
            severity: 'warning',
            message: `${room.name} may not have adequate turning space for wheelchairs`,
            code: `${codeKey}_TURNING_SPACE`,
            location: room.name,
            recommendation: `Ensure ${accessibilityRules.turningSpace}" diameter turning space is available`
          })
          results.summary.warnings++
        } else {
          results.summary.passed++
        }
      })
    }
  }

  /**
   * Check door width compliance
   * @param {Object} layoutData - Layout data
   * @param {Object} rules - Building code rules
   * @param {string} codeKey - Code identifier
   * @param {Object} results - Results object to update
   */
  static checkDoorWidths(layoutData, rules, codeKey, results) {
    const { rooms, circulation } = layoutData
    
    // Simplified door width checking - assumes each circulation path represents a door
    circulation.forEach((path, index) => {
      results.summary.totalChecks++
      const doorWidthInches = Math.min(path.width * 12, 36) // assume max door width of 36"
      const requiredWidth = rules.doorWidth?.minimum || rules.exitWidth?.minimum || 32
      
      if (doorWidthInches < requiredWidth) {
        results.issues.push({
          type: 'door_width',
          severity: 'critical',
          message: `Door width ${doorWidthInches}" is below minimum ${requiredWidth}" required by ${codeKey}`,
          code: `${codeKey}_DOOR_WIDTH`,
          location: `Door ${index + 1}: ${path.from} → ${path.to}`,
          required: requiredWidth,
          actual: doorWidthInches,
          unit: 'inches'
        })
        results.summary.failed++
      } else {
        results.summary.passed++
      }
    })
  }

  /**
   * Infer room type from room name for code checking
   * @param {string} roomName - Name of the room
   * @returns {string} Inferred room type
   */
  static inferRoomType(roomName) {
    const name = roomName.toLowerCase()
    
    if (name.includes('office')) return 'office'
    if (name.includes('meeting') || name.includes('conference')) return 'meeting'
    if (name.includes('restroom') || name.includes('bathroom')) return 'restroom'
    if (name.includes('bedroom')) return 'bedroom'
    if (name.includes('kitchen')) return 'kitchen'
    if (name.includes('living')) return 'living'
    
    return 'general'
  }

  /**
   * Check if a room type requires turning space
   * @param {string} roomName - Name of the room
   * @returns {boolean} Whether the room requires turning space
   */
  static requiresTurningSpace(roomName) {
    const name = roomName.toLowerCase()
    
    // Rooms that typically require wheelchair turning space
    return name.includes('restroom') || 
           name.includes('bathroom') || 
           name.includes('office') ||
           name.includes('meeting') ||
           name.includes('conference')
  }

  /**
   * Get available building codes for a country
   * @param {string} country - Country code
   * @returns {Array} Available building codes
   */
  static getAvailableCodes(country) {
    const countryData = BUILDING_CODES[country]
    if (!countryData) return []

    return Object.keys(countryData).map(codeKey => ({
      key: codeKey,
      name: countryData[codeKey].name,
      version: countryData[codeKey].version
    }))
  }

  /**
   * Get supported countries
   * @returns {Array} Supported country codes
   */
  static getSupportedCountries() {
    return Object.keys(BUILDING_CODES).map(countryCode => ({
      code: countryCode,
      name: this.getCountryName(countryCode),
      codes: this.getAvailableCodes(countryCode)
    }))
  }

  /**
   * Get country name from code
   * @param {string} countryCode - Country code
   * @returns {string} Country name
   */
  static getCountryName(countryCode) {
    const names = {
      US: 'United States',
      CA: 'Canada',
      UK: 'United Kingdom',
      AU: 'Australia'
    }
    return names[countryCode] || countryCode
  }

  /**
   * Generate compliance report
   * @param {Object} complianceResults - Results from checkCompliance
   * @returns {Object} Formatted compliance report
   */
  static generateComplianceReport(complianceResults) {
    const { status, issues, warnings, summary } = complianceResults
    
    return {
      status,
      summary: {
        ...summary,
        complianceRate: summary.totalChecks > 0 ? 
          Math.round((summary.passed / summary.totalChecks) * 100) : 100
      },
      criticalIssues: issues.filter(issue => issue.severity === 'critical'),
      warnings: warnings,
      recommendations: this.generateComplianceRecommendations(issues, warnings),
      nextSteps: this.generateNextSteps(status, issues)
    }
  }

  /**
   * Generate compliance recommendations
   * @param {Array} issues - Compliance issues
   * @param {Array} warnings - Compliance warnings
   * @returns {Array} Recommendations
   */
  static generateComplianceRecommendations(issues, warnings) {
    const recommendations = []
    
    // Group issues by type
    const issuesByType = issues.reduce((acc, issue) => {
      acc[issue.type] = acc[issue.type] || []
      acc[issue.type].push(issue)
      return acc
    }, {})

    // Generate recommendations for each issue type
    Object.keys(issuesByType).forEach(type => {
      const typeIssues = issuesByType[type]
      
      switch (type) {
        case 'corridor_width':
          recommendations.push({
            priority: 'high',
            title: 'Increase Corridor Widths',
            description: `${typeIssues.length} corridor(s) need to be widened to meet code requirements`,
            action: 'Modify layout to increase corridor widths or redesign circulation paths'
          })
          break
          
        case 'room_area':
          recommendations.push({
            priority: 'high',
            title: 'Increase Room Sizes',
            description: `${typeIssues.length} room(s) are below minimum area requirements`,
            action: 'Increase room dimensions or combine adjacent spaces'
          })
          break
          
        case 'accessibility_route':
          recommendations.push({
            priority: 'critical',
            title: 'Improve Accessibility',
            description: `${typeIssues.length} accessible route(s) need to be widened`,
            action: 'Ensure all routes meet ADA width requirements'
          })
          break
      }
    })

    return recommendations
  }

  /**
   * Generate next steps based on compliance status
   * @param {string} status - Compliance status
   * @param {Array} issues - Compliance issues
   * @returns {Array} Next steps
   */
  static generateNextSteps(status, issues) {
    const steps = []
    
    if (status === 'non-compliant') {
      steps.push('Address all critical compliance issues before proceeding')
      steps.push('Review and modify layout design to meet code requirements')
      steps.push('Re-run compliance check after making changes')
    } else if (status === 'warning') {
      steps.push('Review warning items and consider addressing them')
      steps.push('Verify compliance with local amendments to building codes')
      steps.push('Consider consulting with a local architect or code official')
    } else {
      steps.push('Layout appears to meet basic code requirements')
      steps.push('Verify with local building department for any additional requirements')
      steps.push('Consider professional review before final design')
    }
    
    return steps
  }
}

// Export convenience functions
export const checkBuildingCodeCompliance = (layoutData, codeSettings) =>
  BuildingCodesService.checkCompliance(layoutData, codeSettings)

export const getAvailableBuildingCodes = (country) =>
  BuildingCodesService.getAvailableCodes(country)

export const getSupportedCountries = () =>
  BuildingCodesService.getSupportedCountries()
