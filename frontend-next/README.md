# NYC Subway Route Finder - Frontend

A modern React/Next.js frontend for the NYC Subway Route Finder application that visualizes Dijkstra's and A* pathfinding algorithms with real-time route analysis.

## Features

- **Interactive Map Visualization** - Real-time subway route display using Leaflet.js
- **Algorithm Comparison** - Side-by-side comparison of Dijkstra's and A* algorithms
- **Route Analysis** - Detailed performance metrics and station exploration
- **Modern UI** - Built with Tailwind CSS and Radix UI components
- **Real-time Updates** - Live route finding with backend integration
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui
- **Maps**: React Leaflet with Leaflet.js
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- npm 8+
- Backend server running on `http://localhost:8080`

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend-next/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── app-sidebar.tsx # Main sidebar component
│   │   ├── map-visualizer.tsx # Map visualization
│   │   └── algorithm-comparison.tsx # Algorithm comparison
│   ├── lib/                # Utility functions and API
│   │   ├── api/           # API client functions
│   │   └── utils.ts       # Utility functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## API Integration

The frontend connects to the C++ backend server:

- **Base URL**: `http://localhost:8080`
- **Health Check**: `GET /health`
- **Route Finding**: `POST /api/find-route`
- **Algorithm Comparison**: `POST /api/compare-algorithms`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development

### Key Components

- **App Sidebar** (`app-sidebar.tsx`) - Main navigation and route input
- **Map Visualizer** (`map-visualizer.tsx`) - Interactive subway map
- **Algorithm Comparison** (`algorithm-comparison.tsx`) - Performance analysis
- **Location Input** (`location-input.tsx`) - Station selection interface

### Styling

The project uses Tailwind CSS with custom components from Shadcn/ui:
- Consistent design system
- Dark/light mode support
- Responsive breakpoints
- Accessible components

### State Management

- React hooks for local state
- API calls for backend communication
- Real-time updates for route visualization

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

No environment variables required - the frontend automatically connects to `http://localhost:8080` for the backend API.

## Contributing

1. Ensure the backend server is running
2. Install dependencies with `npm install`
3. Start development server with `npm run dev`
4. Make changes and test with the backend integration

## Troubleshooting

- **Backend Connection**: Ensure the C++ server is running on port 8080
- **Map Loading**: Check that Leaflet.js assets are loading correctly
- **API Errors**: Verify backend endpoints are responding correctly
- **Build Issues**: Clear `.next` folder and reinstall dependencies

## Related Documentation

- [Backend Setup Guide](../backend/SETUP_GUIDE.md)
- [Main Project README](../readme.md)
- [Requirements](../requirements.txt)
