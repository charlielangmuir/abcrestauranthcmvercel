import { useState, useMemo, useEffect } from 'react';
import { employeeService } from '../api/employeeService';
import { shiftService } from '../api/shiftService';
import { employeeAvailabilityService } from '../api/employeeAvailabilityService';
import { supabase } from '../api/supabaseClient';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SchedulePage = () => {
  const getWeekDates = (date) => {
  const current = new Date(date);
  const startOfWeek = new Date(current);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(current.getDate() - current.getDay());

  const week = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }

  return week;
};
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [shifts, setShifts] = useState({});
  const [showAddShift, setShowAddShift] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [pendingShift, setPendingShift] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');

  const weekDates = useMemo(() => getWeekDates(selectedWeek), [selectedWeek]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchShiftsForWeek();
  }, [selectedWeek]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll(true);
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftsForWeek = async () => {
    try {
      setShiftsLoading(true);
      const startDate = formatDateForDB(weekDates[0]);
      const endDate = formatDateForDB(weekDates[6]);
      
      const data = await shiftService.getShiftsByDateRange(startDate, endDate);
      
      const shiftsByDate = {};
      data.forEach(shift => {
        const dateKey = shift.shift_date;
        if (!shiftsByDate[dateKey]) {
          shiftsByDate[dateKey] = [];
        }
        shiftsByDate[dateKey].push(shift);
      });
      
      setShifts(shiftsByDate);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      if (error.message?.includes('does not exist')) {
        toast.error('Schedule system is not set up yet. Please contact your administrator.');
      } else {
        toast.error('Failed to load shifts');
      }
      setShifts({});
    } finally {
      setShiftsLoading(false);
    }
  };

  const formatDateForDB = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
    setSelectedDay(null);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setSelectedWeek(new Date());
    setSelectedDay(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const rangesOverlap = (startA, endA, startB, endB) => {
    return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
  };

  const checkShiftConflict = async (employeeId, shiftDate, startTime, endTime) => {
    try {
      // Check if employee is inactive
      const employee = employees.find(e => e.employee_id === employeeId);
      if (!employee) {
        return { type: 'hard', message: 'Cannot schedule: Employee record not found' };
      }

      const isActive =
        employee.is_active === true ||
        employee.is_active === 'true' ||
        employee.status === 'active' ||
        employee.status === 'ACTIVE';

      if (!isActive) {
        return { type: 'soft', message: '⚠️ Employee is marked as inactive. Scheduling anyway will override this status.' };
      }

      // Check for approved time-off on that date
      const { data: timeOff } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'approved')
        .lte('start_date', shiftDate)
        .gte('end_date', shiftDate);

      if (timeOff && timeOff.length > 0) {
        return { type: 'hard', message: 'Cannot schedule: Employee has approved time-off' };
      }

      // Check for overlapping shifts
      const { data: overlapping } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('shift_date', shiftDate)
        .neq('status', 'cancelled');

      if (overlapping && overlapping.length > 0) {
        const hasOverlap = overlapping.some(shift => 
          rangesOverlap(startTime, endTime, shift.start_time, shift.end_time)
        );
        if (hasOverlap) {
          return { type: 'hard', message: 'Cannot schedule: Employee already has overlapping shift' };
        }
      }

      // Check employee availability preference
      const dayOfWeekMap = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
      const date = new Date(shiftDate);
      const dayOfWeek = date.getDay();
      const dayName = dayOfWeekMap[dayOfWeek];

      const availability = await employeeAvailabilityService.getAvailabilityByEmployeeId(employeeId);
      console.log('Availability for employee', employeeId, 'on', dayName, ':', availability[dayName]);
      if (availability[dayName]) {
        const dayAvail = availability[dayName];
        
        if (!dayAvail.available) {
          console.log('Soft conflict: unavailable on', dayName);
          return { 
            type: 'soft', 
            message: `⚠️ Employee marked as unavailable on ${dayName}. Scheduling anyway will override their preference.` 
          };
        }

        if (dayAvail.available && (timeToMinutes(startTime) < timeToMinutes(dayAvail.startTime) || timeToMinutes(endTime) > timeToMinutes(dayAvail.endTime))) {
          console.log('Soft conflict: time outside availability');
          return { 
            type: 'soft', 
            message: `⚠️ Shift time (${startTime}-${endTime}) is outside employee's availability (${dayAvail.startTime}-${dayAvail.endTime})` 
          };
        }
      } else {
        console.log('No availability set for', dayName, 'skipping availability check');
      }

      return { type: 'none' };
    } catch (error) {
      console.error('Error checking conflict:', error);
      return { type: 'none' };
    }
  };

  const completeShiftCreation = async (shiftData) => {
    try {
      const newShift = await shiftService.create(shiftData);
      
      const dateKey = getDateKey(selectedDay);
      setShifts(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newShift],
      }));

      setShowAddShift(false);
      setShowConflictModal(false);
      setPendingShift(null);
      setOverrideReason('');
      toast.success('Shift added successfully');
    } catch (error) {
      console.error('Error adding shift:', error);
      toast.error(error.message || 'Failed to add shift');
    }
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  const getDateKey = (date) => {
    return formatDateForDB(date);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const addShift = async (employeeId, startTime, endTime) => {
    if (!selectedDay) return;

    try {
      const shiftDate = formatDateForDB(selectedDay);
      const conflict = await checkShiftConflict(employeeId, shiftDate, startTime, endTime);

      if (conflict.type === 'hard') {
        toast.error(conflict.message);
        return;
      }

      if (conflict.type === 'soft') {
        // Manager receives this alert message and can override with reason
        toast('⚠️ ' + conflict.message, { icon: '⚠️' });
        setPendingShift({ employeeId, startTime, endTime });
        setConflictInfo(conflict.message);
        setShowConflictModal(true);
        return;
      }

      const shiftData = {
        employee_id: employeeId,
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        status: 'scheduled',
      };

      await completeShiftCreation(shiftData);
    } catch (error) {
      console.error('Error adding shift:', error);
      toast.error('Failed to add shift');
    }
  };

  const removeShift = async (dateKey, shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      await shiftService.delete(shiftId);
      
      setShifts(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].filter(s => s.shift_id !== shiftId),
      }));

      toast.success('Shift deleted successfully');
    } catch (error) {
      console.error('Error deleting shift:', error);
      if (error.message?.includes('does not exist')) {
        toast.error('Schedule system is not set up yet. Please contact your administrator.');
      } else {
        toast.error(error.message || 'Failed to delete shift');
      }
    }
  };

  const getShiftsForDay = (date) => {
    const dateKey = getDateKey(date);
    return shifts[dateKey] || [];
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 10 }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          Loading schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 className="pageTitle">
            Schedule
            {shiftsLoading && (
              <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 12, fontWeight: 400 }}>
                Loading...
              </span>
            )}
          </h1>
          <p className="subtle">Manage employee shifts and schedules</p>
        </div>

        <button
          type="button"
          className="iconBtn"
          onClick={() => toast.info('Auto-generate feature coming soon')}
        >
          <FontAwesomeIcon icon="fa-solid fa-robot" /> Auto-Generate Schedule
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="iconBtn"
              onClick={goToPreviousWeek}
              style={{ padding: '8px 12px' }}
            >
              ←
            </button>
            <button
              type="button"
              className="iconBtn"
              onClick={goToNextWeek}
              style={{ padding: '8px 12px' }}
            >
              →
            </button>
            <button
              type="button"
              className="iconBtn"
              onClick={goToToday}
              style={{ padding: '8px 16px' }}
            >
              Today
            </button>
          </div>

          <div style={{ fontSize: 16, fontWeight: 900 }}>
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}, {weekDates[0].getFullYear()}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 16 }}>
        {weekDates.map((date) => {
          const dateKey = getDateKey(date);
          const dayShifts = getShiftsForDay(date);
          const isSelected = selectedDay && getDateKey(selectedDay) === dateKey;
          
          return (
            <div
              key={dateKey}
              className="card"
              onClick={() => setSelectedDay(date)}
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--primary, #2563eb)' : undefined,
                background: isToday(date) ? 'var(--primary-bg, #eff6ff)' : undefined,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>
                  {formatDayName(date)}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>
                  {date.getDate()}
                </div>
                <div className="subtle" style={{ fontSize: 11, marginTop: 4 }}>
                  {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay ? (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {selectedDay.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="subtle" style={{ marginTop: 4 }}>
                {getShiftsForDay(selectedDay).length} scheduled shift(s)
              </div>
            </div>

            <button
              type="button"
              className="iconBtn"
              onClick={() => setShowAddShift(true)}
            >
              + Add Shift
            </button>
          </div>

          {getShiftsForDay(selectedDay).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {getShiftsForDay(selectedDay).map((shift) => {
                const employee = shift.employees;
                const fullName = employee?.users 
                  ? `${employee.users.first_name} ${employee.users.last_name}` 
                  : 'Unknown Employee';
                const jobTitle = employee?.job_title || 'No title';

                return (
                  <div
                    key={shift.shift_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      border: '1px solid var(--border, #ddd)',
                      borderRadius: 6,
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {fullName}
                      </div>
                      <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>
                        {jobTitle}
                      </div>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeShift(getDateKey(selectedDay), shift.shift_id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        background: 'transparent',
                        border: '1px solid var(--border, #ddd)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        color: '#dc2626',
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="subtle">No shifts scheduled for this day</div>
              <div className="subtle" style={{ fontSize: 12, marginTop: 4 }}>
                Click "Add Shift" to schedule employees
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}><FontAwesomeIcon icon="fa-solid fa-calendar" /></div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Select a day to view and manage shifts
          </div>
          <div className="subtle">
            Click on any day in the week view above to get started
          </div>
        </div>
      )}

      {showAddShift && (
        <AddShiftModal
          employees={employees}
          onAdd={addShift}
          onClose={() => setShowAddShift(false)}
        />
      )}

      {showConflictModal && pendingShift && (
        <ConflictModal
          conflictMessage={conflictInfo}
          overrideReason={overrideReason}
          onReasonChange={setOverrideReason}
          onConfirm={async () => {
            const shiftData = {
              employee_id: pendingShift.employeeId,
              shift_date: formatDateForDB(selectedDay),
              start_time: pendingShift.startTime,
              end_time: pendingShift.endTime,
              status: 'scheduled',
              notes: overrideReason
            };
            await completeShiftCreation(shiftData);
          }}
          onCancel={() => {
            setShowConflictModal(false);
            setPendingShift(null);
            setOverrideReason('');
            setConflictInfo(null);
          }}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: repeat(7, 1fr)"] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .container > div[style*="grid-template-columns: repeat(7, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

const AddShiftModal = ({ employees, onAdd, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedEmployee && startTime && endTime) {
      onAdd(parseInt(selectedEmployee), startTime, endTime);
    }
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
          <div style={{ fontSize: 18, fontWeight: 900 }}>Add Shift</div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--muted)',
              marginBottom: 6,
            }}>
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--border, #ddd)',
                borderRadius: 6,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg, #fff)',
              }}
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => {
                const fullName = `${emp.users?.first_name || ''} ${emp.users?.last_name || ''}`.trim();
                const jobTitle = emp.job_title || '';
                return (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {fullName} {jobTitle && `- ${jobTitle}`}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--muted)',
                marginBottom: 6,
              }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 14,
                  border: '1px solid var(--border, #ddd)',
                  borderRadius: 6,
                  outline: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--bg, #fff)',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--muted)',
                marginBottom: 6,
              }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 14,
                  border: '1px solid var(--border, #ddd)',
                  borderRadius: 6,
                  outline: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--bg, #fff)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 700,
                background: 'transparent',
                border: '1px solid var(--border, #ddd)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="iconBtn"
              style={{ flex: 1 }}
            >
              Add Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConflictModal = ({ conflictMessage, overrideReason, onReasonChange, onConfirm, onCancel }) => {
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
        zIndex: 1001,
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: 500, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Scheduling Conflict</div>
          <button
            type="button"
            onClick={onCancel}
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

        <div style={{ marginBottom: 16, padding: 12, background: '#fff3cd', borderRadius: 6, border: '1px solid #ffc107' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#856404' }}>
            {conflictMessage}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--muted)',
            marginBottom: 6,
          }}>
            Override Reason (optional)
          </label>
          <textarea
            value={overrideReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Explain why you're scheduling this shift despite the conflict..."
            style={{
              width: '100%',
              minHeight: 100,
              padding: '10px 12px',
              fontSize: 14,
              border: '1px solid var(--border, #ddd)',
              borderRadius: 6,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 700,
              background: 'transparent',
              border: '1px solid var(--border, #ddd)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 700,
              background: '#228B22',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Schedule Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;