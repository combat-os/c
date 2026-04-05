// frontend/src/components/Header.jsx
// Header component with user info and logout

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header-military">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-500">🛡️ COMBAT OS</h1>
            <p className="text-military-400 text-sm hidden md:block">Military Battalion Operations System</p>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-military-50">{user.name}</p>
                <p className="text-xs text-military-400">{user.rank} • {user.nrp}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-military text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
