const PayrollPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Payroll</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Process Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Payroll (This Month)</h3>
          <p className="text-3xl font-bold text-gray-900">$45,230</p>
          <p className="text-sm text-green-600 mt-2">↑ 5% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Employees Paid</h3>
          <p className="text-3xl font-bold text-gray-900">28</p>
          <p className="text-sm text-gray-600 mt-2">Out of 30 total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Next Pay Date</h3>
          <p className="text-3xl font-bold text-gray-900">Feb 15</p>
          <p className="text-sm text-gray-600 mt-2">6 days remaining</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Payroll Records</h2>
        </div>

        <div className="p-8 text-center text-gray-500">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg">Payroll records will appear here</p>
          <p className="text-sm text-gray-400 mt-2">
            View paystubs, calculate wages, and process payments
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;