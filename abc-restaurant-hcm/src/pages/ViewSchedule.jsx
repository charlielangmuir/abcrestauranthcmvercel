const ViewSchedule = () => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // November 2025 calendar data
  const calendarDays = [
    { date: 26, currentMonth: false },
    { date: 27, currentMonth: false },
    { date: 28, currentMonth: false },
    { date: 29, currentMonth: false },
    { date: 30, currentMonth: false },
    { date: 31, currentMonth: false },
    { date: 1, currentMonth: true },
    { date: 2, currentMonth: true },
    { date: 3, currentMonth: true },
    { date: 4, currentMonth: true },
    { date: 5, currentMonth: true, isToday: true },
    { date: 6, currentMonth: true },
    { date: 7, currentMonth: true },
    { date: 8, currentMonth: true },
    { date: 9, currentMonth: true },
    { date: 10, currentMonth: true },
    { date: 11, currentMonth: true },
    { date: 12, currentMonth: true },
    { date: 13, currentMonth: true },
    { date: 14, currentMonth: true },
    { date: 15, currentMonth: true },
    { date: 16, currentMonth: true },
    { date: 17, currentMonth: true },
    { date: 18, currentMonth: true },
    { date: 19, currentMonth: true },
    { date: 20, currentMonth: true },
    { date: 21, currentMonth: true },
    { date: 22, currentMonth: true },
    { date: 23, currentMonth: true },
    { date: 24, currentMonth: true },
    { date: 25, currentMonth: true },
    { date: 26, currentMonth: true },
    { date: 27, currentMonth: true },
    { date: 28, currentMonth: true },
    { date: 29, currentMonth: true },
    { date: 30, currentMonth: true },
    { date: 31, currentMonth: true },
    { date: 1, currentMonth: false },
    { date: 2, currentMonth: false },
    { date: 3, currentMonth: false },
    { date: 4, currentMonth: false },
    { date: 5, currentMonth: false },
    { date: 6, currentMonth: false },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">View Schedule</h1>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex gap-8">
          {/* Left Side - Shift Details */}
          <div className="w-1/2">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Shift Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Today:</span> Nov 5, 2025
                </p>
              </div>

              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Your shift:</span> 10:00~14:00(Cashier)
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Calendar */}
          <div className="w-1/2">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">November</h3>

            {/* Calendar Grid */}
            <div className="mb-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      text-center py-2 rounded-lg text-sm
                      ${day.isToday
                        ? 'bg-blue-500 text-white font-bold'
                        : day.currentMonth
                          ? 'text-gray-800 hover:bg-gray-100'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mt-6">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Download PDF
              </button>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSchedule;
