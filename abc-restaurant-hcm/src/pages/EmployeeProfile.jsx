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
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>

      <div className="flex gap-6">
        {/* Left Sidebar Menu */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow p-8">
          <div className="flex flex-col items-center">
            {/* Profile Avatar */}
            <div className="w-32 h-32 rounded-full bg-purple-200 flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Profile Information */}
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <div className="text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">John P Doe</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <div className="text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">Server</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <div className="text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">name@example.com</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <div className="text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">(XXX) XXX-XXXX</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
