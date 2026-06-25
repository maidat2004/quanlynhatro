import { useState, useEffect } from 'react';
import { roomService } from '../services';

export function useRooms(filters = {}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, [JSON.stringify(filters)]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomService.getRooms(filters);
      setRooms(data);
    } catch (err) {
      setError(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomService.getAvailableRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    rooms,
    loading,
    error,
    refresh: fetchRooms,
    getAvailableRooms
  };
}
