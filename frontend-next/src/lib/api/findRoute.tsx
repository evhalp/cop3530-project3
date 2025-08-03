import axios, { AxiosError } from 'axios';
import { RouteRequest, RouteResponse } from '../types/RouteTypes';

export async function findRoute(payload: RouteRequest): Promise<RouteResponse> {
  try {
    const res = await axios.post<RouteResponse>('http://localhost:8080/api/find-route', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await axios.get('http://localhost:8080/health', { timeout: 5000 });
    return true;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}
