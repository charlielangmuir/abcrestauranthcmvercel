import { useState, useEffect } from 'react';

const ViewSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Generate calendar days
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        currentMonth: false,
        isToday: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = year === today.getFullYear() &&
                      month === today.getMonth() &&
                      i === today.getDate();
      days.push({
        date: i,
        currentMonth: true,
        isToday: isToday
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        currentMonth: false,
        isToday: false
      });
    }

    setCalendarDays(days);
  }, [currentDate]);

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="schedule-page">
      {/* Header */}
      <div className="schedule-header">
        <div className="schedule-header-inner">
          <div className="schedule-brand">
            <div className="schedule-logo">
              <svg className="schedule-logo-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="schedule-brand-name">ABC Restaurant HCM</span>
          </div>
          <div className="schedule-actions">
            <button className="schedule-icon-btn">
              <svg className="schedule-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="schedule-icon-btn">
              <svg className="schedule-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="schedule-icon-btn">
              <svg className="schedule-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="schedule-container">
        {/* Title with back button */}
        <div className="schedule-title-section">
          <button className="schedule-back-btn">
            <svg className="schedule-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="schedule-title">View Schedule</h1>
        </div>

        <div className="schedule-content-card">
          <div className="schedule-layout">
            {/* Left - Shift Details */}
            <div className="schedule-shift-section">
              <h2 className="schedule-section-title">Shift Details</h2>

              <div className="schedule-details">
                <div className="schedule-detail-item">
                  <p className="schedule-detail-text">
                    <span className="schedule-detail-label">Today:</span> {formatDate(currentDate)}
                  </p>
                </div>

                <div className="schedule-detail-item">
                  <p className="schedule-detail-text">
                    <span className="schedule-detail-label">Your shift:</span> 10:00~14:00(Cashier)
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Calendar */}
            <div className="schedule-calendar-section">
              <div className="schedule-calendar-header">
                <h2 className="schedule-calendar-title">
                  {monthNames[currentDate.getMonth()]}
                </h2>
                <div className="schedule-calendar-nav">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="schedule-nav-btn"
                  >
                    <svg className="schedule-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="schedule-nav-btn"
                  >
                    <svg className="schedule-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="schedule-calendar-wrapper">
                {/* Day Headers */}
                <div className="schedule-calendar-weekdays">
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="schedule-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="schedule-calendar-grid">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={
                        day.isToday
                          ? 'schedule-day schedule-day-today'
                          : day.currentMonth
                            ? 'schedule-day schedule-day-current'
                            : 'schedule-day schedule-day-other'
                      }
                    >
                      {day.date}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="schedule-action-buttons">
                <button className="schedule-action-btn">
                  Download PDF
                </button>
                <button className="schedule-action-btn">
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSchedule;
