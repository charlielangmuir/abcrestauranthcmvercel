import { useState } from 'react';

const EmployeeProfile = () => {
  const [activeSection, setActiveSection] = useState('Profile');

  const menuItems = [
    'Profile',
    'Account Settings',
    'Password',
    'Notifications',
    'System Preferences'
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-inner">
          <div className="profile-brand">
            <div className="profile-logo">
              <svg className="profile-logo-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="profile-brand-name">ABC Restaurant HCM</span>
          </div>
          <div className="profile-actions">
            <button className="profile-icon-btn">
              <svg className="profile-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="profile-icon-btn">
              <svg className="profile-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="profile-icon-btn">
              <svg className="profile-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-container">
        {/* Title with back button */}
        <div className="profile-title-section">
          <button className="profile-back-btn">
            <svg className="profile-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="profile-title">Profile</h1>
        </div>

        <div className="profile-layout">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            <nav className="profile-nav">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item)}
                  className={activeSection === item ? 'profile-nav-item profile-nav-item-active' : 'profile-nav-item'}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="profile-content">
            <div className="profile-content-inner">
              {/* Avatar */}
              <div className="profile-avatar">
                <svg className="profile-avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Profile Fields */}
              <div className="profile-fields">
                <div className="profile-field">
                  <label className="profile-field-label">Name</label>
                  <div className="profile-field-value-primary">John P Doe</div>
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Role</label>
                  <div className="profile-field-value">Server</div>
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Email</label>
                  <div className="profile-field-value">name@example.com</div>
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Phone</label>
                  <div className="profile-field-value">(XXX) XXX-XXXX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
