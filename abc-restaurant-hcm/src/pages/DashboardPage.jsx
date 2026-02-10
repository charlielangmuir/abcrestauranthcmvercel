import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome back, {user?.email}!
        </h2>
        <p className="text-gray-600">
          This is your dashboard overview. Quick stats and information will appear here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Upcoming Shifts
          </h3>
          <p className="text-3xl font-bold text-blue-600">5</p>
          <p className="text-sm text-blue-700 mt-2">This week</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Hours This Month
          </h3>
          <p className="text-3xl font-bold text-green-600">87.5</p>
          <p className="text-sm text-green-700 mt-2">Out of 160 hours</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Pending Requests
          </h3>
          <p className="text-3xl font-bold text-purple-600">2</p>
          <p className="text-sm text-purple-700 mt-2">Awaiting approval</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;