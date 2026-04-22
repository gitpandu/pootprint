import { useState, useEffect, useCallback } from 'react';

const API_URL = '/api';

export interface PoopEntry {
  id: string;
  datetime: string;
  consistency: number;
  amount: string;
  note: string;
}

export interface EntryInput {
  datetime: string;
  consistency: number;
  amount: string;
  note: string;
}

export function usePoopEntries() {
  const [entries, setEntries] = useState<PoopEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async (isMounted: { current: boolean } = { current: true }) => {
    try {
      const response = await fetch(`${API_URL}/entries`);
      const data = await response.json();
      if (isMounted.current) {
        setEntries(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    Promise.resolve().then(() => fetchEntries(isMounted));
    return () => { isMounted.current = false; };
  }, [fetchEntries]);

  const addEntry = async (entry: EntryInput) => {
    try {
      const response = await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (response.ok) {
        fetchEntries(); // Refresh list
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateEntry = async (id: string, updatedFields: Partial<EntryInput>) => {
    try {
      const response = await fetch(`${API_URL}/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        fetchEntries(); // Refresh list
      }
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/entries/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchEntries(); // Refresh list
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  return { entries, addEntry, updateEntry, deleteEntry, loading };
}
