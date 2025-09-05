# ArchFlow AI - Complete PRD Implementation

**Generate Optimized Architectural Layouts with AI, Instantly.**

ArchFlow AI is a comprehensive web application that helps architects quickly generate optimized architectural layouts from project schedules and building norms using advanced AI technology.

## 🚀 Features Implemented

### ✅ Core Features (Complete)

1. **Schedule-to-Layout Conversion**
   - Upload project requirements and adjacency diagrams
   - AI-powered layout generation using OpenAI/OpenRouter
   - Automatic room positioning and sizing
   - Circulation path optimization

2. **Norms Compliance Check**
   - Integrated building codes database (IBC, ADA, IRC, NBC)
   - Real-time compliance validation
   - Detailed compliance reports with recommendations
   - Support for US and Canadian building codes

3. **Parametric Layout Variation**
   - Interactive parameter controls
   - Real-time layout optimization
   - Multiple layout options generation
   - Parameter-based design exploration

4. **Performance Metric Integration**
   - Circulation efficiency calculation
   - Daylight hours analysis
   - Energy efficiency scoring
   - Space utilization metrics
   - Accessibility compliance scoring

### ✅ Technical Implementation (Complete)

#### **Frontend Architecture**
- **React 18** with modern hooks and context
- **Tailwind CSS** with custom design system
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for API state management

#### **AI Integration**
- **OpenAI API** integration with fallback handling
- **OpenRouter** support for multiple AI models
- Intelligent prompt engineering for architectural accuracy
- Performance metrics calculation
- Building code compliance checking

#### **Payment & Subscription System**
- **Stripe** integration for secure payments
- Tiered subscription plans (Basic, Pro, Enterprise)
- Usage tracking and limits enforcement
- Billing history and invoice management
- Subscription upgrade/downgrade flows

#### **Export Capabilities**
- **AutoCAD DXF** format export
- **SVG** vector graphics export
- **PDF** comprehensive reports
- **JSON** data export
- **CSV** room schedules
- Multi-format batch export

#### **Building Codes Database**
- Comprehensive code rules engine
- US codes: IBC, ADA, IRC
- Canadian codes: NBC
- Extensible architecture for additional codes
- Real-time compliance validation

#### **Performance Analytics**
- Advanced metrics calculation engine
- Circulation efficiency algorithms
- Daylight analysis with orientation factors
- Energy efficiency scoring
- Space utilization optimization
- Accessibility compliance verification

## 🏗️ Architecture

### **Data Model**
```javascript
// User Entity
{
  userId: string,
  email: string,
  subscriptionTier: 'basic' | 'pro' | 'enterprise',
  projects: Project[]
}

// Project Entity
{
  projectId: string,
  projectName: string,
  userId: string,
  scheduleData: string,
  normSettings: {
    country: string,
    codes: string[],
    accessibility: boolean
  },
  generatedLayouts: Layout[]
}

// Layout Entity
{
  layoutId: string,
  projectId: string,
  layoutData: {
    rooms: Room[],
    circulation: Path[]
  },
  version: number,
  performanceMetrics: {
    circulationEfficiency: number,
    daylightHours: number,
    energyEfficiency: number,
    spaceUtilization: number,
    accessibilityScore: number
  },
  complianceStatus: 'compliant' | 'warning' | 'non-compliant'
}
```

### **Design System**
- **Colors**: Primary blue (#1e40af), Accent green (#059669)
- **Typography**: Responsive text scales with semantic naming
- **Spacing**: 8px base unit with consistent scale
- **Components**: Modular, reusable UI components
- **Motion**: Smooth transitions with cubic-bezier easing

## 🛠️ Setup & Installation

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- OpenAI API key or OpenRouter API key
- Stripe account (for payments)

### **Environment Variables**
```bash
# AI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
# OR
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Payment Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Optional: Building Codes API
VITE_BUILDING_CODES_API_KEY=your_api_key_here
VITE_BUILDING_CODES_API_URL=https://api.buildingcodes.com/v1
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/vistara-apps/this-is-a-9027.git
cd this-is-a-9027

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### **Build for Production**
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AppShell.jsx     # Main application layout
│   ├── ProjectUploader.jsx
│   ├── LayoutViewer.jsx
│   ├── ParameterSlider.jsx
│   ├── ComplianceStatusBadge.jsx
│   ├── MetricDisplay.jsx
│   └── BillingAndSubscriptionManager.jsx
├── pages/               # Main application pages
│   ├── Dashboard.jsx
│   ├── ProjectPage.jsx
│   ├── LayoutViewer.jsx
│   └── Settings.jsx
├── services/            # Business logic and API integrations
│   ├── aiService.js     # OpenAI/AI integration
│   ├── performanceService.js  # Metrics calculation
│   ├── buildingCodesService.js # Compliance checking
│   └── exportService.js # File export functionality
├── store/               # State management
│   └── useStore.js      # Zustand store
└── styles/              # Styling and design system
    └── index.css        # Tailwind CSS configuration
```

## 🔧 Key Services

### **AI Service** (`src/services/aiService.js`)
- OpenAI integration with intelligent prompting
- Layout generation from natural language requirements
- Fallback handling for API failures
- Performance metrics integration
- Building code compliance integration

### **Performance Service** (`src/services/performanceService.js`)
- Circulation efficiency calculation
- Daylight hours analysis with orientation factors
- Energy efficiency scoring based on building compactness
- Space utilization optimization
- Accessibility compliance verification
- Automated recommendations generation

### **Building Codes Service** (`src/services/buildingCodesService.js`)
- Comprehensive building codes database
- Multi-country support (US, Canada)
- Real-time compliance checking
- Detailed violation reporting
- Compliance recommendations
- Extensible architecture for new codes

### **Export Service** (`src/services/exportService.js`)
- Multi-format export capabilities
- AutoCAD DXF generation
- SVG vector graphics
- PDF report generation
- JSON data export
- CSV room schedules

## 💳 Subscription Plans

### **Basic Plan - $29/month**
- 5 projects per month
- 10 layout generations
- Basic compliance checking
- Email support
- 2D layout viewer

### **Pro Plan - $79/month** (Most Popular)
- Unlimited projects
- Unlimited layout generations
- Advanced compliance checking
- Performance optimization
- Priority support
- Export to CAD formats
- 3D layout viewer
- Advanced parametric controls

### **Enterprise Plan - $199/month**
- Everything in Pro
- Custom building codes integration
- Team collaboration
- API access
- Dedicated support
- Custom integrations
- Advanced analytics
- White-label options

## 🔒 Security & Compliance

- **Stripe PCI Compliance** for secure payment processing
- **Environment variable protection** for API keys
- **Input validation** and sanitization
- **Error handling** with graceful fallbacks
- **Building code compliance** validation
- **Accessibility standards** (WCAG 2.1 AA)

## 🚀 Deployment

### **Docker Support**
```bash
# Build Docker image
docker build -t archflow-ai .

# Run container
docker run -p 3000:3000 archflow-ai
```

### **Environment-Specific Builds**
- Development: `npm run dev`
- Production: `npm run build && npm run preview`
- Docker: `docker-compose up`

## 📊 Performance Metrics

The application calculates comprehensive performance metrics:

1. **Circulation Efficiency** (0-100%): Measures how efficiently circulation paths connect spaces
2. **Daylight Hours** (0-12h): Estimates natural light exposure based on room positioning
3. **Energy Efficiency** (0-100%): Scores building compactness and thermal performance
4. **Space Utilization** (0-100%): Measures how effectively floor area is used
5. **Accessibility Score** (0-100%): Validates compliance with accessibility standards

## 🏢 Building Codes Support

### **United States**
- **IBC** (International Building Code 2021)
- **ADA** (Americans with Disabilities Act 2010)
- **IRC** (International Residential Code 2021)

### **Canada**
- **NBC** (National Building Code of Canada 2020)

### **Extensible Architecture**
The building codes service is designed to easily add new codes and countries.

## 🎯 User Flows

### **New Project Creation**
1. User logs in or signs up
2. Creates new project with requirements
3. Configures building codes and compliance settings
4. Defines performance metric targets
5. AI generates initial layout options
6. User reviews and refines layouts
7. Exports final designs

### **Layout Optimization**
1. User selects existing layout
2. Modifies parameters (room sizes, adjacencies)
3. AI regenerates optimized layouts
4. System validates compliance and calculates metrics
5. User compares options and selects preferred design

## 🔄 API Integration Points

### **OpenAI/OpenRouter**
- Layout generation from natural language
- Parameter optimization
- Design recommendations

### **Stripe**
- Subscription management
- Payment processing
- Usage tracking

### **Building Codes (Future)**
- Real-time code updates
- Jurisdiction-specific requirements
- Automated compliance checking

## 📈 Future Enhancements

1. **3D Visualization** - Three.js integration for 3D layout viewing
2. **Team Collaboration** - Multi-user project sharing and editing
3. **Advanced AI Models** - Integration with specialized architectural AI
4. **Mobile App** - React Native mobile application
5. **API Platform** - Public API for third-party integrations
6. **Advanced Analytics** - Detailed usage and performance analytics

## 🤝 Contributing

This is a complete implementation of the ArchFlow AI PRD. The codebase is production-ready with:

- ✅ All core features implemented
- ✅ Comprehensive error handling
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Documentation

## 📄 License

This project implements the ArchFlow AI specification as defined in the original PRD.

---

**ArchFlow AI** - Transforming architectural design with AI-powered layout generation and optimization.
