import { useState, useEffect } from 'react';
import { type DashboardDto } from '../types';
import axios from 'axios';

const useDashboard = () => {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api`
      : 'http://localhost:5186/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        setData(response.data);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};

export default useDashboard;