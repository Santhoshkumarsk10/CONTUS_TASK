import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, User, Shield, Key, Calendar, Mail, FileText, CheckCircle, RefreshCw, Activity, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, token, refreshToken } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRotateToken = async () => {
    setRotating(true);
    try {
      await refreshToken();
    } catch (err) {
      console.error('Rotation error', err);
    } finally {
      setRotating(false);
    }
  };

  const fetchStats = async () => {
    setFetchingStats(true);
    setStatsError('');
    setAdminStats(null);
    try {
      const response = await api.get('/admin/stats');
      if (response.data && response.data.success) {
        setAdminStats(response.data.data);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setStatsError(err.response.data.message);
      } else {
        setStatsError('Access Denied. Admin privileges required.');
      }
    } finally {
      setFetchingStats(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'flex-start', padding: '2rem' }}>
      <div className="dashboard-container">
        {/* Navigation Header */}
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <Shield size={24} style={{ color: 'var(--color-secondary)' }} />
            <span>Workspace Panel</span>
          </div>
          <div className="nav-user">
            <span className={`user-badge ${user?.role === 'admin' ? 'role-admin' : ''}`}>
              <Shield size={14} />
              <span>{user?.role === 'admin' ? 'Administrator' : 'Standard Account'}</span>
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
              ) : (
                <>
                  <LogOut size={16} />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Dashboard Grid Content */}
        <div className="grid-dashboard">
          {/* Main User Card */}
          <div className="dashboard-card">
            <h2 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={26} style={{ color: 'var(--color-primary)' }} />
              <span>Welcome Back, {user?.name}!</span>
            </h2>
            <p className="dashboard-subtitle">
              You are securely logged into the client dashboard. Here is your profile details fetched from Laravel API.
            </p>

            <table className="profile-table">
              <tbody>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} />
                      <span>Full Name</span>
                    </div>
                  </td>
                  <td>{user?.name}</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} />
                      <span>Email Address</span>
                    </div>
                  </td>
                  <td>{user?.email}</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} />
                      <span>Access Role</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      letterSpacing: '0.5px',
                      color: user?.role === 'admin' ? 'var(--color-primary)' : 'var(--color-secondary)'
                    }}>
                      {user?.role}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      <span>Registered On</span>
                    </div>
                  </td>
                  <td>{formatDate(user?.created_at)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Side Details / Session Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Session Token Details Card */}
            <div className="dashboard-card" style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: 'var(--color-secondary)' }} />
                <span>Session Credentials</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Your request queries are securely authed via a stateful Sanctum personal access Bearer token:
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                color: 'var(--color-secondary)',
                lineHeight: '1.4',
                marginBottom: '1rem'
              }}>
                Bearer {token?.slice(0, 15)}...{token?.slice(-20)}
              </div>

              {/* Token Rotation Button */}
              <button
                className="btn btn-outline btn-sm"
                style={{ width: '100%', fontSize: '0.8rem', display: 'flex', gap: '6px', justifyContent: 'center' }}
                onClick={handleRotateToken}
                disabled={rotating}
              >
                <RefreshCw size={12} className={rotating ? 'spinner' : ''} />
                <span>{rotating ? 'Rotating Token...' : 'Rotate Bearer Token'}</span>
              </button>
            </div>

            {/* Role-Based Content Card */}
            <div className="dashboard-card" style={{
              padding: '1.8rem',
              border: user?.role === 'admin' ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid var(--border-glass)',
              background: user?.role === 'admin' ? 'radial-gradient(circle at 100% 0%, rgba(168, 85, 247, 0.08) 0%, transparent 60%), var(--bg-card)' : 'var(--bg-card)'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: user?.role === 'admin' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                <span>Role Permissions</span>
              </h3>
              
              {user?.role === 'admin' ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <CheckCircle size={16} style={{ color: 'var(--text-success)', marginTop: '3px', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      <strong>Administrator Mode:</strong> You have unlimited control keys to manage users, read logs, provision server deployments, and override settings.
                    </p>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(168, 85, 247, 0.1)',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    fontWeight: '600',
                    textAlign: 'center',
                    letterSpacing: '0.5px'
                  }}>
                    🛡️ ALL ADMINISTRATIVE SYSTEMS ACTIVE
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle size={16} style={{ color: 'var(--color-secondary)', marginTop: '3px', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      <strong>Regular Access:</strong> You possess standard view permissions. Upgrading to Admin role unlocks developer logs and provisioning tools.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Stats Integration Card (Role-Based Authorization Demonstration) */}
            <div className="dashboard-card" style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Database Statistics</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                Fetch authenticated administrative logs directly from the backend MySQL tables.
              </p>

              {statsError && (
                <div className="alert alert-error" style={{ padding: '8px 12px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  <AlertTriangle size={14} />
                  <span>{statsError}</span>
                </div>
              )}

              {adminStats ? (
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registered Accounts:</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>{adminStats.total_users}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Token Sessions:</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>{adminStats.active_sessions}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>System Diagnostics:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-success)' }}>{adminStats.system_status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Laravel Engine:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>v{adminStats.laravel_version}</span>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%)', boxShadow: 'none' }}
                  onClick={fetchStats}
                  disabled={fetchingStats}
                >
                  {fetchingStats ? (
                    <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
                  ) : (
                    <span>Query System Stats</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
