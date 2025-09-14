'use client';

import { useState } from 'react';
import '../globals.css';

interface UsernamePopupProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
  onSkip: () => void;
}

export default function UsernamePopup({ isOpen, onSubmit, onSkip }: UsernamePopupProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (username.trim().length === 0) {
      setError('Username cannot be empty');
      return;
    }

    if (username.trim().length > 15) {
      setError('Username must be 15 characters or less');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    onSubmit(username.trim());
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <>
      {/* Dark overlay */}
      <div className="popup-overlay" style={{ zIndex: 10000 }}></div>
      
      {/* Username popup */}
      <div className="username-popup">
        <div className="username-popup-content">
          <h2 className="username-popup-title">Welcome to WaifuHub!</h2>
          <p className="username-popup-description">
            Choose a username that will be displayed when you publish waifus to the community.
          </p>
          
          <div className="username-form">
            <label className="username-label">USERNAME (15 characters max)</label>
            <input
              type="text"
              className="username-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your username..."
              maxLength={15}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {error && <p className="username-error">{error}</p>}
            
            <div className="username-buttons">
              <button className="username-skip-button" onClick={handleSkip}>
                SKIP (Use wallet ID)
              </button>
              <button 
                className="username-submit-button" 
                onClick={handleSubmit}
                disabled={!username.trim()}
              >
                SET USERNAME
              </button>
            </div>
          </div>
          
          <p className="username-note">
            You can change your username later in settings.
          </p>
        </div>
      </div>
    </>
  );
}
