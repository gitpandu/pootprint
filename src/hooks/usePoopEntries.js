import { useState, useEffect } from 'react';

const API_URL = '/api';

export function usePoopEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/entries`);
      const data = await response.json();
      setEntries(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addEntry = async (entry) => {
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

  const updateEntry = async (id, updatedFields) => {
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

  const deleteEntry = async (id) => {
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
