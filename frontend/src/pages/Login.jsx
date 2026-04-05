// frontend/src/pages/Login.jsx
// Login page with JWT authentication

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [nrp, setNrp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(nrp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-military-900 to-military-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-military bg-military-800 border-2 border-blue-600">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-500 mb-2">🛡️ COMBAT OS</h1>
            <p className="text-military-400">Military Battalion Operations System</p>
            <p className="text-military-500 text-sm mt-2">Authentication Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-military-300 font-semibold mb-2">
                NRP (Military ID)
              </label>
              <input
                type="text"
                value={nrp}
                onChange={(e) => setNrp(e.target.value)}
                placeholder="e.g., P001"
                className="input-military"
                disabled={loading}
                required
              />
              <p className="text-xs text-military-500 mt-1">Enter your personnel number</p>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded px-3 py-2 text-red-100 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nrp}
              className={`w-full btn-military-primary font-semibold py-3 mt-6 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-military-sm"></span>
                  Logging in...
                </span>
              ) : (
                '🔐 Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-military-700 text-center">
            <p className="text-military-400 text-xs">
              Secure authentication for authorized personnel only
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-military-800 border border-military-700 rounded-lg p-4">
          <p className="text-military-300 text-sm">
            <strong>Demo Credentials:</strong><br />
            NRP: P001, P002, P003, P004
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
