/**
 * Export Service
 * Handles exporting layouts to various formats (DXF, SVG, PDF, etc.)
 */

export class ExportService {
  /**
   * Export layout to DXF format (AutoCAD)
   * @param {Object} layoutData - Layout data with rooms and circulation
   * @param {Object} options - Export options
   * @returns {string} DXF file content
   */
  static exportToDXF(layoutData, options = {}) {
    const { 
      units = 'feet',
      scale = 1,
      includeText = true,
      includeDimensions = false 
    } = options

    const { rooms, circulation } = layoutData
    
    // DXF header
    let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
1
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
2
0
LAYER
2
ROOMS
70
0
62
1
6
CONTINUOUS
0
LAYER
2
CIRCULATION
70
0
62
2
6
CONTINUOUS
0
LAYER
2
TEXT
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`

    // Export rooms as rectangles
    rooms.forEach(room => {
      const x = room.x * scale
      const y = room.y * scale
      const width = room.width * scale
      const height = room.height * scale

      // Room rectangle
      dxf += `0
LWPOLYLINE
8
ROOMS
90
5
70
1
10
${x}
20
${y}
10
${x + width}
20
${y}
10
${x + width}
20
${y + height}
10
${x}
20
${y + height}
10
${x}
20
${y}
`

      // Room label
      if (includeText) {
        dxf += `0
TEXT
8
TEXT
10
${x + width / 2}
20
${y + height / 2}
40
12
1
${room.name}
50
0
7
STANDARD
`
      }
    })

    // Export circulation paths as lines
    circulation.forEach(path => {
      const fromRoom = rooms.find(r => r.id === path.from)
      const toRoom = rooms.find(r => r.id === path.to)
      
      if (fromRoom && toRoom) {
        const x1 = (fromRoom.x + fromRoom.width / 2) * scale
        const y1 = (fromRoom.y + fromRoom.height / 2) * scale
        const x2 = (toRoom.x + toRoom.width / 2) * scale
        const y2 = (toRoom.y + toRoom.height / 2) * scale

        dxf += `0
LINE
8
CIRCULATION
10
${x1}
20
${y1}
11
${x2}
21
${y2}
`
      }
    })

    // DXF footer
    dxf += `0
ENDSEC
0
EOF`

    return dxf
  }

  /**
   * Export layout to SVG format
   * @param {Object} layoutData - Layout data with rooms and circulation
   * @param {Object} options - Export options
   * @returns {string} SVG content
   */
  static exportToSVG(layoutData, options = {}) {
    const { 
      width = 800, 
      height = 600, 
      scale = 1,
      includeText = true,
      backgroundColor = '#ffffff',
      roomColor = '#e5e7eb',
      roomStroke = '#374151',
      circulationColor = '#3b82f6'
    } = options

    const { rooms, circulation } = layoutData
    
    // Calculate bounds
    const bounds = this.calculateBounds(rooms)
    const viewBox = `${bounds.minX * scale} ${bounds.minY * scale} ${(bounds.maxX - bounds.minX) * scale} ${(bounds.maxY - bounds.minY) * scale}`

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .room { fill: ${roomColor}; stroke: ${roomStroke}; stroke-width: 2; }
      .room-text { font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }
      .circulation { stroke: ${circulationColor}; stroke-width: 3; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
`

    // Export rooms
    rooms.forEach(room => {
      const x = room.x * scale
      const y = room.y * scale
      const width = room.width * scale
      const height = room.height * scale

      svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" class="room"/>\n`
      
      if (includeText) {
        svg += `  <text x="${x + width / 2}" y="${y + height / 2}" class="room-text">${room.name}</text>\n`
      }
    })

    // Export circulation paths
    circulation.forEach(path => {
      const fromRoom = rooms.find(r => r.id === path.from)
      const toRoom = rooms.find(r => r.id === path.to)
      
      if (fromRoom && toRoom) {
        const x1 = (fromRoom.x + fromRoom.width / 2) * scale
        const y1 = (fromRoom.y + fromRoom.height / 2) * scale
        const x2 = (toRoom.x + toRoom.width / 2) * scale
        const y2 = (toRoom.y + toRoom.height / 2) * scale

        svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="circulation"/>\n`
      }
    })

    svg += '</svg>'
    return svg
  }

  /**
   * Export layout to PDF format (simplified - generates HTML that can be printed to PDF)
   * @param {Object} layoutData - Layout data
   * @param {Object} projectInfo - Project information
   * @param {Object} options - Export options
   * @returns {string} HTML content for PDF generation
   */
  static exportToPDF(layoutData, projectInfo = {}, options = {}) {
    const { 
      includeMetrics = true,
      includeCompliance = true,
      includeRecommendations = true 
    } = options

    const svg = this.exportToSVG(layoutData, { 
      width: 600, 
      height: 400,
      backgroundColor: '#ffffff'
    })

    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ArchFlow AI - Layout Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .project-info { margin-bottom: 20px; }
        .layout-container { text-align: center; margin: 20px 0; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .metric-label { font-size: 14px; color: #666; }
        .section { margin: 20px 0; }
        .section h3 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>ArchFlow AI Layout Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="project-info">
        <h2>Project Information</h2>
        <p><strong>Project Name:</strong> ${projectInfo.name || 'Untitled Project'}</p>
        <p><strong>Layout Name:</strong> ${projectInfo.layoutName || 'Layout'}</p>
        <p><strong>Total Area:</strong> ${this.calculateTotalArea(layoutData.rooms)} sq ft</p>
        <p><strong>Number of Rooms:</strong> ${layoutData.rooms?.length || 0}</p>
    </div>

    <div class="layout-container">
        <h3>Floor Plan</h3>
        ${svg}
    </div>
`

    if (includeMetrics && projectInfo.metrics) {
      html += `
    <div class="section">
        <h3>Performance Metrics</h3>
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${projectInfo.metrics.circulationEfficiency}%</div>
                <div class="metric-label">Circulation Efficiency</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${projectInfo.metrics.daylightHours}h</div>
                <div class="metric-label">Daylight Hours</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${projectInfo.metrics.energyEfficiency}%</div>
                <div class="metric-label">Energy Efficiency</div>
            </div>
        </div>
    </div>`
    }

    if (includeCompliance && projectInfo.compliance) {
      html += `
    <div class="section">
        <h3>Code Compliance</h3>
        <p><strong>Status:</strong> ${projectInfo.compliance.status}</p>
        <p><strong>Compliance Rate:</strong> ${projectInfo.compliance.complianceRate || 'N/A'}%</p>
    </div>`
    }

    html += `
</body>
</html>`

    return html
  }

  /**
   * Export layout data as JSON
   * @param {Object} layoutData - Layout data
   * @param {Object} metadata - Additional metadata
   * @returns {string} JSON string
   */
  static exportToJSON(layoutData, metadata = {}) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      metadata,
      layout: layoutData
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export room schedule as CSV
   * @param {Array} rooms - Array of room objects
   * @returns {string} CSV content
   */
  static exportRoomScheduleToCSV(rooms) {
    const headers = ['Room ID', 'Room Name', 'Area (sq ft)', 'Width (ft)', 'Height (ft)', 'X Position', 'Y Position']
    
    let csv = headers.join(',') + '\n'
    
    rooms.forEach(room => {
      const row = [
        room.id,
        `"${room.name}"`,
        room.area,
        room.width,
        room.height,
        room.x,
        room.y
      ]
      csv += row.join(',') + '\n'
    })

    return csv
  }

  /**
   * Generate downloadable file blob
   * @param {string} content - File content
   * @param {string} mimeType - MIME type
   * @returns {Blob} File blob
   */
  static createDownloadBlob(content, mimeType) {
    return new Blob([content], { type: mimeType })
  }

  /**
   * Trigger file download in browser
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename
   */
  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Export layout in multiple formats
   * @param {Object} layoutData - Layout data
   * @param {Object} projectInfo - Project information
   * @param {Array} formats - Array of format strings
   * @returns {Object} Export results
   */
  static async exportMultipleFormats(layoutData, projectInfo, formats = ['svg', 'dxf', 'json']) {
    const results = {}
    const timestamp = new Date().toISOString().slice(0, 10)
    const projectName = projectInfo.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'layout'

    for (const format of formats) {
      try {
        let content, mimeType, extension

        switch (format.toLowerCase()) {
          case 'dxf':
            content = this.exportToDXF(layoutData)
            mimeType = 'application/dxf'
            extension = 'dxf'
            break

          case 'svg':
            content = this.exportToSVG(layoutData)
            mimeType = 'image/svg+xml'
            extension = 'svg'
            break

          case 'pdf':
            content = this.exportToPDF(layoutData, projectInfo)
            mimeType = 'text/html'
            extension = 'html'
            break

          case 'json':
            content = this.exportToJSON(layoutData, projectInfo)
            mimeType = 'application/json'
            extension = 'json'
            break

          case 'csv':
            content = this.exportRoomScheduleToCSV(layoutData.rooms)
            mimeType = 'text/csv'
            extension = 'csv'
            break

          default:
            throw new Error(`Unsupported format: ${format}`)
        }

        const blob = this.createDownloadBlob(content, mimeType)
        const filename = `${projectName}_${timestamp}.${extension}`

        results[format] = {
          success: true,
          blob,
          filename,
          size: blob.size
        }
      } catch (error) {
        results[format] = {
          success: false,
          error: error.message
        }
      }
    }

    return results
  }

  // Helper methods

  /**
   * Calculate layout bounds
   * @param {Array} rooms - Array of room objects
   * @returns {Object} Bounds object
   */
  static calculateBounds(rooms) {
    if (!rooms || rooms.length === 0) {
      return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
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

  /**
   * Calculate total area of all rooms
   * @param {Array} rooms - Array of room objects
   * @returns {number} Total area
   */
  static calculateTotalArea(rooms) {
    if (!rooms) return 0
    return rooms.reduce((total, room) => total + room.area, 0)
  }

  /**
   * Get supported export formats
   * @returns {Array} Array of supported formats
   */
  static getSupportedFormats() {
    return [
      {
        key: 'dxf',
        name: 'AutoCAD DXF',
        description: 'CAD format compatible with AutoCAD and other CAD software',
        extension: 'dxf',
        category: 'cad'
      },
      {
        key: 'svg',
        name: 'SVG Vector',
        description: 'Scalable vector graphics format',
        extension: 'svg',
        category: 'vector'
      },
      {
        key: 'pdf',
        name: 'PDF Report',
        description: 'Comprehensive layout report with metrics',
        extension: 'pdf',
        category: 'document'
      },
      {
        key: 'json',
        name: 'JSON Data',
        description: 'Raw layout data in JSON format',
        extension: 'json',
        category: 'data'
      },
      {
        key: 'csv',
        name: 'Room Schedule',
        description: 'Room information in CSV format',
        extension: 'csv',
        category: 'data'
      }
    ]
  }
}

// Export convenience functions
export const exportLayoutToDXF = (layoutData, options) => 
  ExportService.exportToDXF(layoutData, options)

export const exportLayoutToSVG = (layoutData, options) => 
  ExportService.exportToSVG(layoutData, options)

export const exportLayoutToPDF = (layoutData, projectInfo, options) => 
  ExportService.exportToPDF(layoutData, projectInfo, options)

export const downloadLayoutFile = (layoutData, projectInfo, format) => {
  const results = ExportService.exportMultipleFormats(layoutData, projectInfo, [format])
  const result = results[format]
  
  if (result.success) {
    ExportService.downloadFile(result.blob, result.filename)
    return { success: true, filename: result.filename }
  } else {
    return { success: false, error: result.error }
  }
}
