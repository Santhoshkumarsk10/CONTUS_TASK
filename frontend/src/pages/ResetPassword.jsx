import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, RefreshCw, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract variables from search query params
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  // State variables
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If token or email is missing, show an immediate inline error
  useEffect(() => {
    if (!token || !email) {
      setApiError('Invalid password reset session. Missing email or authentication token.');
    }
  }, [token, email]);

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'New password is required';
    } else {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/[a-zA-Z]/.test(password)) {
        newErrors.password = 'Password must contain at least one letter';
      } else if (!/\d/.test(password)) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!/[@$!%*?&#^()_+=\[\]{};':"\\|,.<>\/?~`-]/.test(password)) {
        newErrors.password = 'Password must contain at least one special character';
      }
    }

    if (password !== passwordConfirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setErrors({});

    if (!token || !email) {
      setApiError('Invalid session. Cannot reset password without correct URL credentials.');
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.data && response.data.success) {
        setSuccessMessage(response.data.message);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          const validationErrors = {};
          Object.keys(data.errors).forEach((key) => {
            validationErrors[key] = data.errors[key][0];
          });
          setErrors(validationErrors);
          setApiError(data.message || 'Validation errors occurred.');
        } else {
          setApiError(data.message || 'Reset password session has expired or is invalid.');
        }
      } else {
        setApiError('Something went wrong during resetting. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">New Password</h1>
          <p className="auth-subtitle">Configure your secure new account password</p>
        </div>

        {successMessage ? (
          <div>
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', textAlign: 'center' }}>
              Your password has been successfully updated. You can now log in with your new credentials!
            </p>

            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <span>Proceed to Login</span>
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

            {/* Password input */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting || !token || !email}
                  style={{ paddingRight: '45px' }}
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password input */}
            <div className="form-group">
              <label className="form-label" htmlFor="passwordConfirmation">Confirm New Password</label>
              <div className="input-wrapper">
                <input
                  id="passwordConfirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password_confirmation ? 'is-invalid' : ''}`}
                  placeholder="Repeat new password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  disabled={submitting || !token || !email}
                  style={{ paddingRight: '45px' }}
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  {errors.password_confirmation}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
              disabled={submitting || !token || !email}
            >
              {submitting ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Update Password</span>
                </>
              )}
            </button>

            <div className="auth-links" style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ArrowLeft size={16} />
                <span>Cancel and Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
