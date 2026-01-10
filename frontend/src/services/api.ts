import axios from 'axios';

type SalesPoint = {
  ds: string;
  y: number;
};

type ForecastInterval = {
  time: string;
  demand: number;
  confidence_low: number;
  confidence_high: number;
};

type Forecast = {
  intervals: ForecastInterval[];
};

type Staff = {
  id: string;
  name: string;
  wage: number;
  skill: string;
};

type Shift = {
  staff_id: string;
  name: string;
  start: string;
  end: string;
  cost: number;
};

type Schedule = {
  shifts: Shift[];
  total_cost: number;
};

type OptimizeRequest = {
  forecast: ForecastInterval[];
  staff: Staff[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s for Prophet/OR-Tools
});

// Health check
export const healthCheck = () => api.get('/health');

// Forecast sales demand
export const forecastSales = async (history: SalesPoint[]): Promise<Forecast> => {
  const response = await api.post<Forecast>('/forecast-json', { history });
  return response.data;
};

// Optimize shifts
export const optimizeShifts = async (req: OptimizeRequest): Promise<Schedule> => {
  const response = await api.post<Schedule>('/optimize-json', req);
  return response.data;
};

export default api;
