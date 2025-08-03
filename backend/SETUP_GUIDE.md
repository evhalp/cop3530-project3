# Backend HTTP Server Setup Guide

## Overview
This guide covers setting up the complete backend HTTP server that connects frontend to the route finding algorithms. The server includes both Dijkstra's and A* algorithms with duplicate station prevention.

## What's Complete
- HTTP server with cpp-httplib
- CORS headers configured for frontend integration
- CSV data loading from subway_travel_times.csv
- Dijkstra algorithm integration with duplicate prevention
- A* algorithm integration with duplicate prevention
- Station lookup by name 
- Health check endpoint
- Route finding endpoint
- Algorithm comparison endpoint
- Build system with CMake
- All compilation errors resolved
- Duplicate station filtering implemented

## Prerequisites
- C++17 compatible compiler (MSVC, GCC, or Clang)
- CMake 3.10 or higher
- Git (for cloning the repository)

## Step 1: Download Dependencies

### Download Required Header Files
Run these commands from the project root:

```bash
# Create include directory if it doesn't exist
mkdir -p backend/include

# Download httplib.h
curl -o backend/include/httplib.h https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h

# Download json.hpp
curl -o backend/include/json.hpp https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp
```

**Windows PowerShell:**
```powershell
# Create include directory
New-Item -ItemType Directory -Force -Path backend\include

# Download httplib.h
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h" -OutFile "backend\include\httplib.h"

# Download json.hpp
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp" -OutFile "backend\include\json.hpp"
```

## Step 2: Build the Server

### Command Line Build
```bash
cd backend
mkdir build
cd build
cmake ..
cmake --build . --config Debug
```

**Windows:**
```powershell
cd backend
mkdir build
cd build
cmake ..
cmake --build . --config Debug
```

### IDE Setup

#### Visual Studio Setup
1. Open Visual Studio
2. Select "Open a local folder"
3. Navigate to the `backend` directory
4. Visual Studio will detect the CMakeLists.txt and configure the project
5. Set `subway_server` as the startup project
6. Build using Ctrl+Shift+B or Build > Build Solution
7. Debug using F5 or Debug > Start Debugging

**Visual Studio Configuration:**
- The project uses MSVC compiler flags (`/W3` for warnings)
- C++17 standard is enforced
- Include paths are automatically configured

#### CLion Setup
1. Open CLion
2. Select "Open" and navigate to the `backend` directory
3. CLion will automatically detect the CMake project
4. Configure the CMake settings if needed:
   - Build Type: Debug
   - Generator: Default
5. Build using Ctrl+F9 or Build > Build Project
6. Run/Debug using Shift+F10 or Run > Run

**CLion Configuration:**
- The project uses GCC/Clang compiler flags (`-Wall -Wextra`)
- C++17 standard is enforced
- Include paths are automatically configured

## Step 3: Run the Server

### Command Line
```bash
cd backend/build/Debug  # Windows
# or
cd backend/build        # Linux/Mac
./subway_server
```

### IDE
- **Visual Studio**: Press F5 or click the green play button
- **CLion**: Press Shift+F10 or click the green play button

The server will:
1. Load subway data from CSV (may take a few seconds)
2. Display debug information about loaded stations
3. Start HTTP server on port 8080
4. Be ready to accept requests

## Step 4: Test the Server

### Health Check
```bash
curl http://localhost:8080/health
```

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/health"
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00Z"}
```

### Route Finding Test
```bash
curl -X POST http://localhost:8080/api/find-route \
  -H "Content-Type: application/json" \
  -d '{
    "start_station": "1 Av",
    "end_station": "3 Av",
    "month": 1,
    "day": 15,
    "time": "08:00"
  }'
```

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/find-route" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"start_station":"1 Av","end_station":"3 Av","month":1,"day":15,"time":"08:00"}'
```

Expected response:
```json
{
  "route": ["1 Av", "3 Av"],
  "estimated_time_minutes": 1.0
}
```

### Algorithm Comparison Test
```bash
curl -X POST http://localhost:8080/api/compare-algorithms \
  -H "Content-Type: application/json" \
  -d '{
    "start_station": "116 St-Columbia University",
    "end_station": "59 St-Columbus Circle",
    "month": 1,
    "day": 15,
    "time": "08:00"
  }'
```

Expected response includes both algorithms with performance metrics.

## API Endpoints

### GET /health
Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### POST /api/find-route
Find optimal route between two stations using Dijkstra's algorithm.

**Request:**
```json
{
  "start_station": "Station Name",
  "end_station": "Station Name", 
  "month": 1,
  "day": 15,
  "time": "14:30"
}
```

**Response:**
```json
{
  "route": ["Station 1", "Station 2", "Station 3"],
  "estimated_time_minutes": 12.5
}
```

### POST /api/compare-algorithms
Compare Dijkstra's and A* algorithms with detailed performance metrics.

**Request:**
```json
{
  "start_station": "Station Name",
  "end_station": "Station Name", 
  "month": 1,
  "day": 15,
  "time": "14:30"
}
```

**Response:**
```json
{
  "dijkstra": {
    "route": ["Station 1", "Station 2", "Station 3"],
    "estimated_time_minutes": 12.5,
    "stations_explored": 15,
    "execution_time_ms": 2.5,
    "exploration_steps": ["Station 1", "Station 1 (explored)", "Station 2"],
    "algorithm": "dijkstra"
  },
  "astar": {
    "route": ["Station 1", "Station 2", "Station 3"],
    "estimated_time_minutes": 12.5,
    "stations_explored": 12,
    "execution_time_ms": 1.8,
    "exploration_steps": ["Station 1", "Station 1 (explored)", "Station 2"],
    "algorithm": "astar"
  },
  "winner": "astar",
  "performance_metrics": {
    "time_difference": 0.0,
    "exploration_difference": -3,
    "efficiency_ratio": 0.72
  }
}
```

## CORS Configuration
The server automatically adds CORS headers for frontend integration:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Available Stations
The server loads stations from `data/subway_travel_times.csv`. Available stations include:
- "1 Av", "3 Av", "Bedford Av", "103 St", "110 St", "96 St"
- "Cathedral Pkwy (110 St)", "103 St-Corona Plaza", "111 St"
- "Junction Blvd", "104 St", "Rockaway Blvd"
- "116 St-Columbia University", "59 St-Columbus Circle"

## Duplicate Station Prevention
The backend now includes robust duplicate station filtering:
- **Issue**: Multiple station IDs could map to the same station name
- **Solution**: Filter by station names instead of station IDs
- **Implementation**: Uses `unordered_set<string>` to track seen station names
- **Result**: Clean routes without duplicate stations

## Debugging

### Visual Studio Debugging
1. Set breakpoints in source files
2. Use F5 to start debugging
3. Check the Debug Console for output
4. Use the Watch window to inspect variables
5. Step through code with F10 (step over) or F11 (step into)

### CLion Debugging
1. Set breakpoints by clicking in the gutter
2. Use Shift+F9 to start debugging
3. Check the Debug tool window for output
4. Use the Variables tab to inspect state
5. Step through code with F8 (step over) or F7 (step into)

### Common Debug Points
- `http_server.cpp:44` - CSV loading
- `http_server.cpp:85` - Route finding endpoint
- `AdjacencyList.cpp:35` - CSV parsing
- `AdjacencyList.cpp:95` - Station lookup
- `Dijkstra.cpp:52` - Duplicate filtering
- `AStar.cpp:35` - Duplicate filtering

## Troubleshooting

### Build Issues
- **Missing headers**: Ensure httplib.h and json.hpp are in backend/include/
- **Compiler errors**: Verify C++17 support
- **CMake errors**: Check CMake version (3.10+ required)
- **Missing includes**: Ensure `#include <iostream>` and `#include <unordered_set>` are present

### Runtime Issues
- **Port 8080 in use**: Change port in http_server.cpp or kill existing process
- **CSV file not found**: Verify data/subway_travel_times.csv exists
- **Station not found**: Check station names match CSV data exactly
- **Duplicate stations**: Ensure latest code with duplicate filtering is compiled

### IDE-Specific Issues
- **Visual Studio**: Check that MSVC compiler is selected
- **CLion**: Verify CMake configuration in Settings > Build, Execution, Deployment > CMake

## Frontend Integration (Next.js)
Once the server is running:
1. Navigate to the `frontend-next` directory
2. Install dependencies: `npm install`
3. Start the frontend: `npm run dev`
4. The frontend will automatically connect to the backend on `http://localhost:8080`

## Performance Notes
- CSV loading takes 2-3 seconds on first startup
- Route finding responses are typically under 100ms
- Algorithm comparison provides detailed performance metrics
- Server handles concurrent requests efficiently
- Memory usage scales with CSV data size
- Duplicate filtering adds minimal overhead 