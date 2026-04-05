// frontend/src/components/PersonnelList.jsx
// Component to display personnel list

import React, { useState, useEffect } from 'react';
import { personnelAPI } from '../utils/api';

export const PersonnelList = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await personnelAPI.list();
      setPersonnel(response.data.data);
    } catch (err) {
      setError('Failed to fetch personnel');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-military">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-400">👥 Personnel Directory</h2>
        <button
          onClick={fetchPersonnel}
          disabled={loading}
          className="btn-military text-sm"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded px-4 py-3 text-red-100 mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="loading-military-lg"></div>
        </div>
      )}

      {!loading && personnel.length === 0 && (
        <p className="text-military-400 text-center py-8">No personnel found</p>
      )}

      {!loading && personnel.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personnel.map((person) => (
            <div
              key={person.id}
              className="bg-military-700 border border-military-600 rounded-lg p-4 hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-military-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-military-50">{person.name}</p>
                  <p className="text-xs text-military-400">{person.rank}</p>
                  <p className="text-xs text-blue-400 font-mono">{person.nrp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonnelList;
