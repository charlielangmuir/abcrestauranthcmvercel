import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { authService } from '../api/authService';
import { employeeService } from '../api/employeeService';

const ProfilePage = () => {
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const role = (user?.user_metadata?.role || 'EMPLOYEE').toString();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : '—';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoadingProfile(true);
        setProfileError('');

        const data = await employeeService.getByUserId(user.id);
        setEmployee(data);
        setFirstName(data?.users?.first_name || '');
        setLastName(data?.users?.last_name || '');
        setPhone(data?.users?.phone || '');
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfileError(error.message || 'Failed to load profile.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const resetProfileForm = () => {
    setFirstName(employee?.users?.first_name || '');
    setLastName(employee?.users?.last_name || '');
    setPhone(employee?.users?.phone || '');
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      resetProfileForm();
      setProfileMessage('');
      setProfileError('');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      setProfileError('User session not found.');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage('');
      setProfileError('');

      await employeeService.updateProfileByUserId(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
      });

      const refreshed = await employeeService.getByUserId(user.id);
      setEmployee(refreshed);
      setFirstName(refreshed?.users?.first_name || '');
      setLastName(refreshed?.users?.last_name || '');
      setPhone(refreshed?.users?.phone || '');

      setProfileMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setPasswordLoading(true);
      setPasswordMessage('');
      setPasswordError('');

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('Please fill in all password fields.');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('New password and confirm password do not match.');
        return;
      }

      if (currentPassword === newPassword) {
        setPasswordError('New password must be different from your current password.');
        return;
      }

      await authService.login(user.email, currentPassword);
      await authService.updatePassword(newPassword);

      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid var(--border, #ddd)',
    borderRadius: 6,
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'var(--bg, #fff)',
  };

  const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  };

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="pageTitle">My Profile</h1>
          <p className="subtle">Manage your account information and security settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 14 }}>
              {loadingProfile ? 'Loading...' : fullName || 'No name set'}
            </div>
            <div className="subtle" style={{ marginTop: 6 }}>
              {user?.email || '—'}
            </div>

            <div
              style={{
                marginTop: 12,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'var(--primary-bg, #eff6ff)',
                border: '1px solid var(--primary, #2563eb)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {role}
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border, #ddd)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span className="subtle">Member Since</span>
                <span style={{ fontWeight: 700 }}>{memberSince}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span className="subtle">Employee ID</span>
                <span style={{ fontWeight: 700 }}>{employee?.employee_number || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span className="subtle">Department</span>
                <span style={{ fontWeight: 700 }}>{employee?.department || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span className="subtle">Job Title</span>
                <span style={{ fontWeight: 700 }}>{employee?.job_title || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span className="subtle">Employment Type</span>
                <span style={{ fontWeight: 700 }}>{employee?.employment_type || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span className="subtle">Hire Date</span>
                <span style={{ fontWeight: 700 }}>{employee?.hire_date || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>Personal Information</div>
                <div className="subtle" style={{ marginTop: 4 }}>
                  Update your personal details
                </div>
              </div>

              <button
                type="button"
                className="iconBtn"
                onClick={handleToggleEdit}
                disabled={loadingProfile}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {profileMessage && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px',
                  borderRadius: 8,
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  color: '#991b1b',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {profileError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  style={isEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                  style={isEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  style={isEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  Department
                </label>
                <input
                  type="text"
                  value={employee?.department || ''}
                  disabled
                  style={disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  Job Title
                </label>
                <input
                  type="text"
                  value={employee?.job_title || ''}
                  disabled
                  style={disabledInputStyle}
                />
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => {
                    resetProfileForm();
                    setIsEditing(false);
                    setProfileMessage('');
                    setProfileError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="iconBtn"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Change Password</div>
              <div className="subtle" style={{ marginTop: 4 }}>
                Update your account password securely
              </div>
            </div>

            {passwordMessage && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px',
                  borderRadius: 8,
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  color: '#991b1b',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  type="submit"
                  className="iconBtn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .container > div[style*="grid-template-columns: 320px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .container input {
            font-size: 16px !important;
          }

          .container > div .card form > div[style*="grid-template-columns: 1fr 1fr"],
          .container > div .card > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;