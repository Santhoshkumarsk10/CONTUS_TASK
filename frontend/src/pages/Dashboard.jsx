import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LogOut, User, Shield, Key, Calendar, Mail, FileText, CheckCircle, 
  RefreshCw, Activity, AlertTriangle, UserPlus, Plus, X, Eye, EyeOff, Info
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, token, refreshToken } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Admin section state variables
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating a new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');
  const [mailNotification, setMailNotification] = useState('');

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

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    setFetchingUsers(true);
    setUsersError('');
    try {
      const response = await api.get('/admin/users');
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setUsersError('Failed to retrieve registered users.');
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchUsers();
    }
  }, [user]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateError('');
    setCreateSuccess('');
    setMailNotification('');

    // Input validations
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('All fields are required.');
      setCreatingUser(false);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newEmail)) {
      setCreateError('Please enter a valid email address.');
      setCreatingUser(false);
      return;
    }

    // Password strength check
    if (newPassword.length < 8) {
      setCreateError('Password must be at least 8 characters long.');
      setCreatingUser(false);
      return;
    } else if (!/[a-zA-Z]/.test(newPassword)) {
      setCreateError('Password must contain at least one letter.');
      setCreatingUser(false);
      return;
    } else if (!/\d/.test(newPassword)) {
      setCreateError('Password must contain at least one number.');
      setCreatingUser(false);
      return;
    } else if (!/[@$!%*?&#^()_+=\[\]{};':"\\|,.<>\/?~`-]/.test(newPassword)) {
      setCreateError('Password must contain at least one special character.');
      setCreatingUser(false);
      return;
    }

    try {
      const response = await api.post('/admin/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole
      });

      if (response.data && response.data.success) {
        setCreateSuccess('User account provisioned successfully!');
        if (response.data.mail_sent) {
          setMailNotification(response.data.mail_message || 'SMTP Mail delivered to ' + newEmail);
        } else {
          setMailNotification('User created, but SMTP failed. Check logs.');
        }

        // Clear forms
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('user');

        // Refetch database states and list
        fetchUsers();
        fetchStats();

        // Close modal after a short delay
        setTimeout(() => {
          setIsModalOpen(false);
          setCreateSuccess('');
          setMailNotification('');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors && typeof data.errors === 'object') {
          // Grab the first validation message
          const firstErrKey = Object.keys(data.errors)[0];
          setCreateError(data.errors[firstErrKey][0]);
        } else {
          setCreateError(data.message || 'Failed to create user.');
        }
      } else {
        setCreateError('An unexpected server error occurred.');
      }
    } finally {
      setCreatingUser(false);
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

        {/* Administration Hub Panel (Rendered only for authed admins) */}
        {user?.role === 'admin' && (
          <div className="dashboard-card" style={{ marginTop: '2rem', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="dashboard-title" style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserPlus size={26} style={{ color: 'var(--color-secondary)' }} />
                  <span>Users Directory & Control</span>
                </h2>
                <p className="dashboard-subtitle" style={{ margin: '0.3rem 0 0 0' }}>
                  Manage registered accounts, view system profiles, and instantly provision new credentials.
                </p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setIsModalOpen(true)}
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)', width: 'auto', padding: '10px 20px' }}
              >
                <Plus size={16} />
                <span>Create New User</span>
              </button>
            </div>

            {usersError && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertTriangle size={18} />
                <span>{usersError}</span>
              </div>
            )}

            {fetchingUsers ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', borderTopColor: 'var(--color-secondary)' }}></div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Retrieving secure user list...</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Full Name</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Email Address</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>System Role</th>
                      <th style={{ padding: '14px 20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="user-table-row">
                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: '500' }}>{u.name}</td>
                        <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                            color: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-secondary)'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          No accounts registered in directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Create User Form */}
        {isModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(5, 5, 8, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out', padding: '1rem'
          }}>
            <div className="auth-card" style={{ position: 'relative', width: '100%', maxWidth: '480px', animation: 'cardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <button 
                onClick={() => { setIsModalOpen(false); setCreateError(''); setCreateSuccess(''); setMailNotification(''); }} 
                style={{
                  position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s'
                }}
                className="close-modal-btn"
              >
                <X size={20} />
              </button>

              <div className="auth-header" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <h3 className="auth-title" style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Provision New User</h3>
                <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>Create an account and automatically dispatch SMTP credentials.</p>
              </div>

              {createError && (
                <div className="alert alert-error" style={{ padding: '10px 14px', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                  <AlertTriangle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <div className="alert alert-success" style={{ padding: '10px 14px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={16} />
                    <span>{createSuccess}</span>
                  </div>
                  {mailNotification && (
                    <div style={{
                      background: 'rgba(6, 182, 212, 0.05)',
                      border: '1px dashed rgba(6, 182, 212, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Info size={14} />
                      <span>{mailNotification}</span>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleCreateUser} noValidate>
                {/* Full Name */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Jane Doe"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={creatingUser}
                    />
                    <User className="input-icon" size={18} />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="jane@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={creatingUser}
                    />
                    <Mail className="input-icon" size={18} />
                  </div>
                </div>

                {/* Password field */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Temporary Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Min 8 characters, number, symbol"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={creatingUser}
                      style={{ paddingRight: '45px' }}
                    />
                    <Key className="input-icon" size={18} />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex="-1"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Role selection */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">System Role</label>
                  <div className="input-wrapper">
                    <select
                      className="form-input"
                      style={{ appearance: 'none', paddingRight: '40px' }}
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      disabled={creatingUser}
                    >
                      <option value="user">Regular User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <Shield className="input-icon" size={18} />
                    <div style={{
                      position: 'absolute', right: '16px', color: 'var(--text-muted)',
                      pointerEvents: 'none', width: '0', height: '0',
                      borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                      borderTop: '6px solid var(--text-muted)'
                    }}></div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={creatingUser}>
                  {creatingUser ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Provision User Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
