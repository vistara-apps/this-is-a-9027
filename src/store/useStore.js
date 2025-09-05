import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // User state
  user: {
    id: 'demo-user',
    email: 'demo@archflow.ai',
    subscriptionTier: 'pro',
  },

  // Projects state
  projects: [
    {
      id: 'project-1',
      name: 'Modern Office Complex',
      createdAt: new Date('2024-01-15'),
      scheduleData: 'Open office spaces with meeting rooms, kitchen, reception area',
      normSettings: {
        country: 'US',
        codes: ['ADA', 'IBC'],
        accessibility: true,
      },
      layouts: ['layout-1', 'layout-2'],
    },
    {
      id: 'project-2',
      name: 'Residential Apartment',
      createdAt: new Date('2024-01-10'),
      scheduleData: '2BR/2BA apartment with living room, kitchen, dining area',
      normSettings: {
        country: 'US',
        codes: ['ADA', 'IRC'],
        accessibility: true,
      },
      layouts: ['layout-3'],
    },
  ],

  // Generated layouts state
  layouts: [
    {
      id: 'layout-1',
      projectId: 'project-1',
      name: 'Option A - Open Plan',
      layoutData: {
        rooms: [
          { id: 'reception', name: 'Reception', area: 200, x: 50, y: 50, width: 300, height: 200 },
          { id: 'office1', name: 'Open Office', area: 800, x: 400, y: 50, width: 600, height: 400 },
          { id: 'meeting1', name: 'Meeting Room 1', area: 150, x: 50, y: 300, width: 250, height: 200 },
          { id: 'meeting2', name: 'Meeting Room 2', area: 150, x: 50, y: 550, width: 250, height: 200 },
          { id: 'kitchen', name: 'Kitchen', area: 120, x: 400, y: 500, width: 300, height: 150 },
        ],
        circulation: [
          { from: 'reception', to: 'office1', width: 8 },
          { from: 'office1', to: 'meeting1', width: 6 },
          { from: 'office1', to: 'meeting2', width: 6 },
          { from: 'office1', to: 'kitchen', width: 8 },
        ]
      },
      version: 1,
      performanceMetrics: {
        circulationEfficiency: 85,
        daylightHours: 7.2,
        energyEfficiency: 78,
      },
      complianceStatus: 'compliant',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'layout-2',
      projectId: 'project-1',
      name: 'Option B - Zoned Plan',
      layoutData: {
        rooms: [
          { id: 'reception', name: 'Reception', area: 200, x: 50, y: 50, width: 300, height: 200 },
          { id: 'office1', name: 'Office Zone A', area: 400, x: 400, y: 50, width: 400, height: 300 },
          { id: 'office2', name: 'Office Zone B', area: 400, x: 400, y: 400, width: 400, height: 300 },
          { id: 'meeting1', name: 'Meeting Room', area: 200, x: 50, y: 300, width: 300, height: 200 },
          { id: 'kitchen', name: 'Kitchen', area: 150, x: 50, y: 550, width: 300, height: 150 },
        ],
        circulation: [
          { from: 'reception', to: 'office1', width: 8 },
          { from: 'reception', to: 'office2', width: 8 },
          { from: 'reception', to: 'meeting1', width: 6 },
          { from: 'meeting1', to: 'kitchen', width: 6 },
        ]
      },
      version: 1,
      performanceMetrics: {
        circulationEfficiency: 72,
        daylightHours: 8.1,
        energyEfficiency: 82,
      },
      complianceStatus: 'warning',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'layout-3',
      projectId: 'project-2',
      name: 'Compact Layout',
      layoutData: {
        rooms: [
          { id: 'living', name: 'Living Room', area: 300, x: 50, y: 50, width: 400, height: 250 },
          { id: 'kitchen', name: 'Kitchen', area: 120, x: 500, y: 50, width: 200, height: 200 },
          { id: 'dining', name: 'Dining', area: 150, x: 500, y: 300, width: 200, height: 200 },
          { id: 'bedroom1', name: 'Master Bedroom', area: 200, x: 50, y: 350, width: 300, height: 200 },
          { id: 'bedroom2', name: 'Bedroom 2', area: 150, x: 50, y: 600, width: 250, height: 180 },
          { id: 'bath1', name: 'Master Bath', area: 80, x: 400, y: 350, width: 150, height: 120 },
          { id: 'bath2', name: 'Bath 2', area: 60, x: 350, y: 600, width: 120, height: 100 },
        ],
        circulation: [
          { from: 'living', to: 'kitchen', width: 4 },
          { from: 'living', to: 'dining', width: 4 },
          { from: 'living', to: 'bedroom1', width: 4 },
          { from: 'living', to: 'bedroom2', width: 4 },
        ]
      },
      version: 1,
      performanceMetrics: {
        circulationEfficiency: 88,
        daylightHours: 6.5,
        energyEfficiency: 75,
      },
      complianceStatus: 'compliant',
      createdAt: new Date('2024-01-10'),
    },
  ],

  // Actions
  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: `project-${Date.now()}`, createdAt: new Date() }]
  })),

  updateProject: (projectId, updates) => set((state) => ({
    projects: state.projects.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    )
  })),

  addLayout: (layout) => set((state) => ({
    layouts: [...state.layouts, { ...layout, id: `layout-${Date.now()}`, createdAt: new Date() }]
  })),

  updateLayout: (layoutId, updates) => set((state) => ({
    layouts: state.layouts.map(layout => 
      layout.id === layoutId ? { ...layout, ...updates } : layout
    )
  })),

  getProjectLayouts: (projectId) => {
    const state = get()
    return state.layouts.filter(layout => layout.projectId === projectId)
  },

  getProject: (projectId) => {
    const state = get()
    return state.projects.find(project => project.id === projectId)
  },

  getLayout: (layoutId) => {
    const state = get()
    return state.layouts.find(layout => layout.id === layoutId)
  },

  updateUser: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
}))
