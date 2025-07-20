export interface RouteRequest {
  start_station: string;
  end_station: string;
  month: number;
  day: number;
  time: string;
}

export interface RouteResponse {
  route: string[];
  estimated_time_minutes: number;
}
