// frontend/src/components/LogsViewer.jsx
// Component to display scan logs

import React from 'react';

export const LogsViewer = ({ logs, loading, error, onRefresh }) => {
  return (
    <div className="card-military">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-400">📋 Scan Logs</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-military text-sm"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
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

      {!loading && logs.length === 0 && (
        <p className="text-military-400 text-center py-8">No scan logs found</p>
      )}

      {!loading && logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-military">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>NRP</th>
                <th>POS</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.name || 'N/A'}</td>
                  <td className="font-mono text-military-400">{log.nrp}</td>
                  <td className="text-blue-400">{log.pos_name}</td>
                  <td className="text-military-400">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className="badge-military-success">
                      ✓ Scanned
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsViewer;
