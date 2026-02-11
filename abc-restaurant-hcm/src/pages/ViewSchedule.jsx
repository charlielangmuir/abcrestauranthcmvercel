import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/dashboardService';
import toast from 'react-hot-toast';

const ViewSchedule = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    if (user?.id) {
      fetchMonthlySchedule();
    }
  }, [currentDate, user?.id]);

  const fetchMonthlySchedule = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const data = await dashboardService.getMonthlySchedule(user.id, year, month);
      setShifts(data.shifts || []);
      setTimeOffRequests(data.timeOffRequests || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

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

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        fullDate: new Date(prevMonthYear, prevMonth, daysInPrevMonth - i),
        currentMonth: false,
        isToday: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = year === today.getFullYear() &&
                      month === today.getMonth() &&
                      i === today.getDate();
      days.push({
        date: i,
        fullDate: new Date(year, month, i),
        currentMonth: true,
        isToday: isToday
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        fullDate: new Date(nextMonthYear, nextMonth, i),
        currentMonth: false,
        isToday: false
      });
    }

    setCalendarDays(days);
  }, [currentDate]);

  const formatDateForDB = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5);
  };

  const hasShift = (date) => {
    if (!date) return false;
    const dateStr = formatDateForDB(date);
    return shifts.some(shift => shift.shift_date === dateStr);
  };

  const hasTimeOff = (date) => {
    if (!date) return false;
    const dateStr = formatDateForDB(date);
    return timeOffRequests.some(request => {
      return dateStr >= request.start_date && dateStr <= request.end_date;
    });
  };

  const getShiftsForDay = (date) => {
    if (!date) return [];
    const dateStr = formatDateForDB(date);
    return shifts.filter(shift => shift.shift_date === dateStr);
  };

  const getTimeOffForDay = (date) => {
    if (!date) return [];
    const dateStr = formatDateForDB(date);
    return timeOffRequests.filter(request => 
      dateStr >= request.start_date && dateStr <= request.end_date
    );
  };

  const getDayClass = (day) => {
    let classes = 'schedule-day';
    
    if (day.isToday) {
      classes += ' schedule-day-today';
    } else if (!day.currentMonth) {
      classes += ' schedule-day-other';
    } else {
      classes += ' schedule-day-current';
    }

    if (day.currentMonth) {
      if (hasShift(day.fullDate)) {
        classes += ' schedule-day-shift';
      } else if (hasTimeOff(day.fullDate)) {
        classes += ' schedule-day-timeoff';
      }
    }

    return classes;
  };

  const handleDayClick = (day) => {
    if (!day.currentMonth) return;
    setSelectedDay(day);
    setShowDayModal(true);
  };

  const getTodayShift = () => {
    const today = new Date();
    const todayStr = formatDateForDB(today);
    const todayShifts = shifts.filter(shift => shift.shift_date === todayStr);
    
    if (todayShifts.length > 0) {
      const shift = todayShifts[0];
      return `${formatTime(shift.start_time)}~${formatTime(shift.end_time)}${shift.position ? `(${shift.position})` : ''}`;
    }
    return 'No shift scheduled';
  };

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <div className="schedule-title-section">
          <button 
            className="schedule-back-btn"
            onClick={() => window.history.back()}
          >
            <svg className="schedule-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="schedule-title">View Schedule</h1>
        </div>

        <div className="schedule-content-card">
          <div className="schedule-layout">
            <div className="schedule-shift-section">
              <h2 className="schedule-section-title">Shift Details</h2>

              <div className="schedule-details">
                <div className="schedule-detail-item">
                  <p className="schedule-detail-text">
                    <span className="schedule-detail-label">Today:</span> {formatDate(new Date())}
                  </p>
                </div>

                <div className="schedule-detail-item">
                  <p className="schedule-detail-text">
                    <span className="schedule-detail-label">Your shift:</span> {loading ? 'Loading...' : getTodayShift()}
                  </p>
                </div>
              </div>
            </div>

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

              <div style={{
                display: 'flex',
                gap: 16,
                marginBottom: 12,
                fontSize: 13,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: '#228B22'
                  }} />
                  <span>Work Day</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: '#F5DEB3'
                  }} />
                  <span>Time Off</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: '#3b82f6'
                  }} />
                  <span>Today</span>
                </div>
              </div>

              <div className="schedule-calendar-wrapper">
                <div className="schedule-calendar-weekdays">
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="schedule-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="schedule-calendar-grid">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={getDayClass(day)}
                      onClick={() => handleDayClick(day)}
                      style={{ cursor: day.currentMonth ? 'pointer' : 'default' }}
                    >
                      {day.date}
                    </div>
                  ))}
                </div>
              </div>

              <div className="schedule-action-buttons">
                <button 
                  className="schedule-action-btn"
                  onClick={() => toast.info('PDF download coming soon')}
                >
                  Download PDF
                </button>
                <button 
                  className="schedule-action-btn"
                  onClick={() => toast.info('Availability feature coming soon')}
                >
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDayModal && selectedDay && (
        <DayDetailsModal
          day={selectedDay}
          shifts={getShiftsForDay(selectedDay.fullDate)}
          timeOff={getTimeOffForDay(selectedDay.fullDate)}
          onClose={() => setShowDayModal(false)}
          formatTime={formatTime}
        />
      )}

      <style>{`
        .schedule-day-shift {
          background-color: #228B22 !important;
          color: white !important;
          font-weight: 700;
        }

        .schedule-day-shift:hover {
          background-color: #1a6b1a !important;
        }

        .schedule-day-timeoff {
          background-color: #F5DEB3 !important;
          color: #8B4513 !important;
          font-weight: 700;
        }

        .schedule-day-timeoff:hover {
          background-color: #dbc79e !important;
        }

        .schedule-day-current:hover {
          background-color: #f3f4f6 !important;
        }

        .schedule-day-today:hover {
          background-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
};

const DayDetailsModal = ({ day, shifts, timeOff, onClose, formatTime }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 500, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            {formatDate(day.fullDate)}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'var(--muted)',
            }}
          >
            ×
          </button>
        </div>

        {shifts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
              SCHEDULED SHIFTS
            </div>
            {shifts.map((shift) => (
              <div
                key={shift.shift_id}
                style={{
                  padding: 12,
                  background: '#228B22',
                  color: 'white',
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                </div>
                {shift.position && (
                  <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                    Position: {shift.position}
                  </div>
                )}
                {shift.notes && (
                  <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                    Notes: {shift.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {timeOff.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
              TIME OFF
            </div>
            {timeOff.map((request) => (
              <div
                key={request.request_id}
                style={{
                  padding: 12,
                  background: '#F5DEB3',
                  color: '#8B4513',
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
                {request.reason && (
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Reason: {request.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {shifts.length === 0 && timeOff.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
            <div className="subtle">No events scheduled for this day</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSchedule;