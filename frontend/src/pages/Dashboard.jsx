// frontend/src/pages/Dashboard.jsx
// Main dashboard with tabs for different features

import React, { useState, useEffect } from 'react';
import { logsAPI } from '../utils/api';
import Header from '../components/Header';
import LogsViewer from '../components/LogsViewer';
import PersonnelList from '../components/PersonnelList';
import QRScanner from '../components/QRScanner';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await logsAPI.list(true);
      setLogs(response.data.data);
    } catch (err) {
      setError('Failed to fetch logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'logs', label: '📋 Scan Logs', icon: '📋' },
    { id: 'personnel', label: '👥 Personnel', icon: '👥' },
    { id: 'qr-scan', label: '📱 QR Scan', icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-military-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-military whitespace-nowrap ${
                activeTab === tab.id
                  ? 'btn-military-primary'
                  : 'btn-military-ghost'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-military bg-blue-900 border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-military-400 text-sm">Total Scans</p>
                    <p className="text-3xl font-bold text-blue-400">{logs.length}</p>
                  </div>
                  <span className="text-4xl">📊</span>
                </div>
              </div>

              <div className="card-military bg-green-900 border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-military-400 text-sm">Active Personnel</p>
                    <p className="text-3xl font-bold text-green-400">
                      {new Set(logs.map(log => log.personnel_id)).size}
                    </p>
                  </div>
                  <span className="text-4xl">👥</span>
                </div>
              </div>

              <div className="card-military bg-purple-900 border-purple-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-military-400 text-sm">Last Scan</p>
                    <p className="text-sm font-semibold text-purple-400">
                      {logs.length > 0
                        ? new Date(logs[0]?.timestamp).toLocaleString('id-ID')
                        : 'No scans'}
                    </p>
                  </div>
                  <span className="text-4xl">🔍</span>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <LogsViewer logs={logs} loading={loading} error={error} onRefresh={fetchLogs} />
          )}

          {/* Personnel Tab */}
          {activeTab === 'personnel' && <PersonnelList />}

          {/* QR Scan Tab */}
          {activeTab === 'qr-scan' && <QRScanner onScanSuccess={fetchLogs} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
