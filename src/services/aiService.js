import OpenAI from 'openai'

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export async function generateLayoutFromSchedule(scheduleData, normSettings) {
  try {
    const prompt = `You are an expert architect. Generate a realistic architectural floor plan layout based on the following requirements:

Project Requirements: ${scheduleData}

Building Standards: ${JSON.stringify(normSettings)}

Return a JSON object with the following structure:
{
  "rooms": [
    {
      "id": "unique_room_id",
      "name": "Room Name",
      "area": area_in_sqft,
      "x": x_position,
      "y": y_position,
      "width": room_width,
      "height": room_height
    }
  ],
  "circulation": [
    {
      "from": "room_id",
      "to": "room_id", 
      "width": corridor_width_in_feet
    }
  ]
}

Guidelines:
- Create realistic room sizes and proportions
- Ensure proper adjacencies as described in requirements
- Include circulation paths between rooms
- Consider building codes and accessibility requirements
- Position rooms on a coordinate system (0,0 is top-left)
- Use reasonable dimensions (offices: 100-400 sqft, meeting rooms: 150-300 sqft, etc.)

Return only the JSON object, no other text.`

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const responseText = response.choices[0].message.content.trim()
    
    // Try to parse the JSON response
    try {
      const layoutData = JSON.parse(responseText)
      return layoutData
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      
      // Fallback to a default layout structure if parsing fails
      return generateFallbackLayout(scheduleData)
    }
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    
    // Fallback to a default layout if API fails
    return generateFallbackLayout(scheduleData)
  }
}

function generateFallbackLayout(scheduleData) {
  // Generate a simple fallback layout based on common architectural patterns
  const rooms = []
  const circulation = []
  
  // Parse schedule data for room types (basic heuristic)
  const text = scheduleData.toLowerCase()
  
  let currentX = 50
  let currentY = 50
  const roomSpacing = 50
  
  if (text.includes('office')) {
    rooms.push({
      id: 'office_main',
      name: 'Main Office Space',
      area: 600,
      x: currentX,
      y: currentY,
      width: 500,
      height: 400
    })
    currentX += 550
  }
  
  if (text.includes('meeting')) {
    rooms.push({
      id: 'meeting_room',
      name: 'Meeting Room',
      area: 200,
      x: currentX,
      y: currentY,
      width: 300,
      height: 250
    })
    currentY += 300
  }
  
  if (text.includes('kitchen') || text.includes('break')) {
    rooms.push({
      id: 'kitchen',
      name: 'Kitchen/Break Room',
      area: 150,
      x: currentX,
      y: currentY,
      width: 250,
      height: 200
    })
  }
  
  if (text.includes('reception')) {
    rooms.push({
      id: 'reception',
      name: 'Reception',
      area: 120,
      x: 50,
      y: currentY + 250,
      width: 300,
      height: 150
    })
  }
  
  // Add basic circulation between rooms
  for (let i = 0; i < rooms.length - 1; i++) {
    circulation.push({
      from: rooms[i].id,
      to: rooms[i + 1].id,
      width: 6
    })
  }
  
  return { rooms, circulation }
}

export async function optimizeLayoutParameters(layoutData, parameters) {
  // This would integrate with AI to adjust the layout based on parameter changes
  // For now, return a modified version of the existing layout
  
  const optimizedLayout = JSON.parse(JSON.stringify(layoutData))
  
  // Apply parameter modifications (simplified)
  if (parameters.roomSize) {
    optimizedLayout.rooms = optimizedLayout.rooms.map(room => ({
      ...room,
      width: room.width * parameters.roomSize,
      height: room.height * parameters.roomSize,
      area: room.area * (parameters.roomSize * parameters.roomSize)
    }))
  }
  
  return optimizedLayout
}

export async function checkComplianceStatus(layoutData, normSettings) {
  // Simplified compliance checking
  // In a real app, this would integrate with building code databases
  
  const issues = []
  
  // Check for basic accessibility requirements
  if (normSettings.accessibility) {
    layoutData.circulation.forEach(path => {
      if (path.width < 4) {
        issues.push(`Circulation path from ${path.from} to ${path.to} is too narrow for accessibility (${path.width}ft < 4ft required)`)
      }
    })
  }
  
  // Check room sizes
  layoutData.rooms.forEach(room => {
    if (room.area < 80 && room.name.toLowerCase().includes('office')) {
      issues.push(`${room.name} is below minimum office size (${room.area} sqft < 80 sqft)`)
    }
  })
  
  return {
    status: issues.length === 0 ? 'compliant' : (issues.length < 3 ? 'warning' : 'non-compliant'),
    issues: issues
  }
}