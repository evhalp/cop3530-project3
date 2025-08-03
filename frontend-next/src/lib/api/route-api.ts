export interface RouteRequest {
  start_station: string;
  end_station: string;
  time: string;
}

export interface RouteResponse {
  route: string[];
  estimated_time_minutes: number;
}

export interface AlgorithmResult {
  route: string[];
  estimated_time_minutes: number;
  stations_explored: number;
  execution_time_ms: number;
  exploration_steps: string[];
  algorithm: 'dijkstra' | 'astar';
}

export interface AlgorithmComparison {
  dijkstra: AlgorithmResult;
  astar: AlgorithmResult;
  winner: 'dijkstra' | 'astar' | 'tie';
  performance_metrics: {
    time_difference: number;
    exploration_difference: number;
    efficiency_ratio: number;
  };
}

export interface RouteError {
  error: string;
  message: string;
}

const API_BASE_URL = 'http://localhost:8080';

export async function findRoute(request: RouteRequest): Promise<RouteResponse> {
  try {
    console.log('Making findRoute API call to:', `${API_BASE_URL}/api/find-route`)
    console.log('Request data:', request)
    
    const response = await fetch(`${API_BASE_URL}/api/find-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const errorData: RouteError = await response.json();
      console.error('API error response:', errorData)
      throw new Error(errorData.message || 'Failed to find route');
    }

    const data: RouteResponse = await response.json();
    console.log('API success response:', data)
    return data;
  } catch (error) {
    console.error('findRoute error:', error)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

export async function compareAlgorithms(request: RouteRequest): Promise<AlgorithmComparison> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/compare-algorithms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: RouteError = await response.json();
      throw new Error(errorData.message || 'Failed to compare algorithms');
    }

    const data: AlgorithmComparison = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Function to simulate exploration steps for visualization
export function generateExplorationSteps(route: string[]): {
  dijkstra: string[];
  astar: string[];
} {
  // Get all stations from the parsed data
  const allStations = [
    "Times Sq-42 St", "Grand Central-42 St", "34 St-Penn Station", "14 St-Union Sq",
    "Bedford Av", "Jackson Hts-Roosevelt Av", "161 St-Yankee Stadium", "Atlantic Av-Barclays Ctr",
    "World Trade Center", "Fulton St", "Coney Island-Stillwell Av", "Rockefeller Center",
    "Central Park", "Columbus Circle", "Lincoln Center", "Washington Square Park",
    "Astor Pl", "1 Av", "3 Av", "103 St", "110 St", "125 St", "Harlem-148 St",
    "Bronx", "Queens", "Brooklyn", "Manhattan"
  ];

  // Simulate Dijkstra's algorithm (explores more broadly)
  const dijkstraSteps: string[] = [];
  const visited = new Set<string>();
  
  // Start from the first station in route
  if (route.length > 0) {
    dijkstraSteps.push(route[0]);
    visited.add(route[0]);
  }

  // Simulate exploring neighboring stations
  route.forEach((station, index) => {
    if (index > 0) {
      // Add some "exploration" of nearby stations before finding the route
      const nearbyStations = allStations.filter(s => 
        !visited.has(s) && 
        Math.random() < 0.3 && // 30% chance to explore a random station
        s !== station
      ).slice(0, 2); // Explore up to 2 random stations

      nearbyStations.forEach(s => {
        dijkstraSteps.push(s);
        visited.add(s);
      });

      // Then add the actual route station
      dijkstraSteps.push(station);
      visited.add(station);
    }
  });

  // Simulate A* algorithm (more targeted, fewer explorations)
  const astarSteps: string[] = [];
  const astarVisited = new Set<string>();
  
  if (route.length > 0) {
    astarSteps.push(route[0]);
    astarVisited.add(route[0]);
  }

  route.forEach((station, index) => {
    if (index > 0) {
      // A* explores fewer stations (more targeted)
      const nearbyStations = allStations.filter(s => 
        !astarVisited.has(s) && 
        Math.random() < 0.1 && // 10% chance (less exploration than Dijkstra)
        s !== station
      ).slice(0, 1); // Explore only 1 random station

      nearbyStations.forEach(s => {
        astarSteps.push(s);
        astarVisited.add(s);
      });

      astarSteps.push(station);
      astarVisited.add(station);
    }
  });

  return {
    dijkstra: dijkstraSteps,
    astar: astarSteps
  };
} 