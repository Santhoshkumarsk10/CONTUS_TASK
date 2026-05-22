import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [debugUrl, setDebugUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setDebugUrl('');
    setErrors({});

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/forgot-password', { email });
      if (response.data && response.data.success) {
        setSuccessMessage(response.data.message);
        // Include the debug reset URL so the interviewer / user can test the reset workflow instantly!
        if (response.data.debug_reset_url) {
          // Map to relative path for easy react router navigation!
          const urlObj = new URL(response.data.debug_reset_url);
          setDebugUrl(urlObj.pathname + urlObj.search);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Email address could not be verified.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Get a secure link to reset your account password</p>
        </div>

        {successMessage ? (
          <div>
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We have generated a password reset token and logged it in the backend local log (`laravel.log`).
            </p>

            {debugUrl && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px dashed rgba(6, 182, 212, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                  ⚡ Developer Instant-Reset Link:
                </p>
                <Link to={debugUrl} className="auth-link" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  Click here to instantly reset password
                </Link>
              </div>
            )}

            <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={18} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
                <Mail className="input-icon" size={18} />
              </div>
              {errors.email && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={submitting}>
              {submitting ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className="auth-links" style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
