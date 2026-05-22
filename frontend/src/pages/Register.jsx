import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, Shield, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('user'); // Default to 'user', supports selection
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (password !== passwordConfirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await register(name, email, password, passwordConfirmation, role);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          // Flatten Laravel's structured validation errors to display inline next to inputs!
          const validationErrors = {};
          Object.keys(data.errors).forEach((key) => {
            validationErrors[key] = data.errors[key][0];
          });
          setErrors(validationErrors);
          setApiError(data.message || 'Validation errors occurred.');
        } else {
          setApiError(data.message || 'Registration failed.');
        }
      } else {
        setApiError('Something went wrong during registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register to access the client workspace</p>
        </div>

        {apiError && !Object.keys(errors).length && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name field */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Santhosh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
              <User className="input-icon" size={18} />
            </div>
            {errors.name && (
              <span className="error-text">
                <AlertCircle size={14} />
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Address field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="santhosh@example.com"
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

          {/* Role selection field */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">Account Role</label>
            <div className="input-wrapper">
              <select
                id="role"
                className="form-input"
                style={{ appearance: 'none', paddingRight: '40px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={submitting}
              >
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
              <Shield className="input-icon" size={18} />
              {/* Add custom arrow for vanilla select styling */}
              <div style={{
                position: 'absolute', right: '16px', color: 'var(--text-muted)',
                pointerEvents: 'none', width: '0', height: '0',
                borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                borderTop: '6px solid var(--text-muted)'
              }}></div>
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <Lock className="input-icon" size={18} />
            </div>
            {errors.password && (
              <span className="error-text">
                <AlertCircle size={14} />
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="passwordConfirmation">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="passwordConfirmation"
                type="password"
                className={`form-input ${errors.password_confirmation ? 'is-invalid' : ''}`}
                placeholder="Repeat password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={submitting}
              />
              <Lock className="input-icon" size={18} />
            </div>
            {errors.password_confirmation && (
              <span className="error-text">
                <AlertCircle size={14} />
                {errors.password_confirmation}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={submitting}>
            {submitting ? (
              <div className="spinner"></div>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
