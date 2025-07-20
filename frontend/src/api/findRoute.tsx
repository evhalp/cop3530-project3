// placeholder for now
// just mocking for my own testing so I can get started at least

import axios from 'axios';
import { RouteRequest, RouteResponse } from '../types/RouteTypes';

export async function findRoute(payload: RouteRequest): Promise<RouteResponse> {
  const res = await axios.post<RouteResponse>('http://localhost:8080/api/find-route', payload);
  return res.data;
}
