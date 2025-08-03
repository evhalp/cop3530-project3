# NYC Subway Route Finder

A comprehensive subway route finding application that compares Dijkstra's and A* pathfinding algorithms with real-time visualization.

## Features

- **Real-time Route Finding**: Find optimal subway routes between any NYC stations
- **Algorithm Comparison**: Compare Dijkstra's and A* algorithms side-by-side
- **Interactive Visualization**: Watch algorithms explore the subway network in real-time
- **Performance Metrics**: Detailed analysis of execution time, stations explored, and efficiency
- **Real Data**: Uses actual NYC subway travel time data

## Project Links

- **GitHub Repository**: [https://github.com/evhalp/cop3530-project3](https://github.com/evhalp/cop3530-project3)
- **Full Project Report**: [https://docs.google.com/document/d/1halcyYEXS0xQAn8bXsAK8gsWX_gdwXxMKryls0j6yi0/edit?usp=sharing](https://docs.google.com/document/d/1halcyYEXS0xQAn8bXsAK8gsWX_gdwXxMKryls0j6yi0/edit?usp=sharing)
- **Development Notes**: [https://docs.google.com/document/d/1DLw_PSLIfAsIRHR22YOWzyK55wgtM4HXomyMnlujVLc/edit?tab=t.0](https://docs.google.com/document/d/1DLw_PSLIfAsIRHR22YOWzyK55wgtM4HXomyMnlujVLc/edit?tab=t.0)

## Technology Stack

- **Frontend**: React + TypeScript + Next.js + Tailwind CSS
- **Backend**: C++ with httplib
- **Map Visualization**: Leaflet.js
- **Data**: NYC Subway travel times CSV

## Algorithm Comparison

The application demonstrates the difference between:
- **Dijkstra's Algorithm**: Systematic exploration of all possible paths
- **A* Algorithm**: Heuristic-based search for optimal efficiency

## Getting Started

### Prerequisites

- **Backend**: C++17 compatible compiler (MSVC, GCC, or Clang), CMake 3.10+
- **Frontend**: Node.js 18+ and npm

### Backend Setup

1. **Download Dependencies** (run from project root):

   **Linux/Mac:**
   ```bash
   mkdir -p backend/include
   curl -o backend/include/httplib.h https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h
   curl -o backend/include/json.hpp https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp
   ```

   **Windows PowerShell:**
   ```powershell
   New-Item -ItemType Directory -Force -Path backend\include
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h" -OutFile "backend\include\httplib.h"
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp" -OutFile "backend\include\json.hpp"
   ```

2. **Build the Server:**
   ```bash
   cd backend
   mkdir build
   cd build
   cmake ..
   cmake --build .
   ```

3. **Run the Backend Server:**
   ```bash
   # Linux/Mac
   cd backend/build
   ./subway_server
   
   # Windows
   cd backend/build/Debug
   subway_server.exe
   ```

   The server will start on `http://localhost:8080`

### Frontend Setup

**Option 1: Vite Frontend (Recommended)**
```bash
cd frontend
npm install
npm run dev
```

**Option 2: Next.js Frontend**
```bash
cd frontend-next
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite) or `http://localhost:3000` (Next.js)

### Testing the Application

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Test Route Finding:**
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

3. **Access the Web Interface:**
   - Open your browser to the frontend URL
   - Select start and end stations
   - Choose your preferred algorithm
   - View the route visualization and performance metrics

## Data Structure

```cpp
struct Station {
    string station_name;
    pair<double, double> coordinates;
};

struct Edge {
    string start_station;
    string end_station;
    map<array<int, 3>, double> time_map;  // [month, day, time] → avg_time
};

// Adjacency list format
unordered_map<string, vector<Edge>> adj_list;
```

## Troubleshooting

### Backend Issues
- **Port 8080 in use**: Change port in `backend/src/http_server.cpp` or kill existing process
- **CSV file not found**: Verify `data/subway_travel_times.csv` exists
- **Build errors**: Ensure C++17 support and CMake 3.10+

### Frontend Issues
- **Dependencies**: Run `npm install` in the frontend directory
- **Port conflicts**: Change port in `vite.config.ts` or `next.config.ts`
- **Backend connection**: Ensure backend server is running on port 8080

### IDE Setup
- **Visual Studio**: Open `backend` folder, set `subway_server` as startup project
- **CLion**: Open `backend` folder, configure CMake settings
- **VS Code**: Install C++ extensions and use CMake Tools extension 

