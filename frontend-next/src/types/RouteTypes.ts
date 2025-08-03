export interface RouteRequest {
  start_station: string;
  end_station: string;
  time: string;
}

export interface RouteResponse {
  route: string[];
  estimated_time_minutes: number;
}

// New types for algorithm comparison
export interface AlgorithmResult {
  algorithm: 'Dijkstra' | 'A*';
  route: string[];
  estimated_time_minutes: number;
  time_complexity: string;
  nodes_explored: number;
}

export interface ComparisonResponse {
  dijkstra: AlgorithmResult;
  astar: AlgorithmResult;
  winner: 'Dijkstra' | 'A*';
  current_time: string;
  eta: string;
}
