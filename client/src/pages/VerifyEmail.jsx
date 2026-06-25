import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }
    authAPI.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully. You can now sign in.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Invalid or expired verification link');
      });
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2>{status === 'verifying' ? 'Verifying...' : status === 'success' ? 'Verified' : 'Verification Failed'}</h2>
        <p>{message}</p>
        <button className="btn btn-primary" onClick={() => navigate('/auth')}>
          Go to Sign In
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;