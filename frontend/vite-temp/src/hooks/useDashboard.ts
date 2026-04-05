import { useState, useEffect } from 'react';
import { DashboardDto } from '../types/dashboard';

const useDashboard = () => {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://localhost:5186/api/dashboard');

        if (!response.ok) {
          const text = await response.text();
          console.error('Dashboard API error response:', response.status, response.statusText, text);
          throw new Error(`Dashboard request failed: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        try {
          const result: DashboardDto = JSON.parse(text);
          setData(result);
        } catch (parseErr) {
          console.error('Failed to parse dashboard JSON:', text);
          throw new Error('Invalid JSON from dashboard endpoint');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };


    fetchDashboard();
  }, []);

  return { data, loading, error };
};

export default useDashboard;
