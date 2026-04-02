import { useState, useEffect } from 'react';
import { employeeAvailabilityService } from '../../api/employeeAvailabilityService';
import { employeeService } from '../../api/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AvailabilityEditor = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(null);
  const [availability, setAvailability] = useState({
    Monday: { available: true, startTime: '09:00', endTime: '17:00' },
    Tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
    Wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
    Thursday: { available: true, startTime: '09:00', endTime: '17:00' },
    Friday: { available: true, startTime: '09:00', endTime: '17:00' },
    Saturday: { available: false, startTime: '09:00', endTime: '17:00' },
    Sunday: { available: false, startTime: '09:00', endTime: '17:00' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const employee = await employeeService.getByUserId(user.id);
        if (employee?.employee_id) {
          setEmployeeId(employee.employee_id);
        }
      } catch (error) {
        console.error('Error resolving employeeId from user:', error);
      }
    };
    init();
  }, [user?.id]);

  useEffect(() => {
    if (employeeId) {
      loadAvailability();
    }
  }, [employeeId]);

  const loadAvailability = async () => {
    if (!employeeId) {
      return;
    }

    try {
      setLoading(true);
      const cacheKey = `availability-${employeeId}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        setAvailability(JSON.parse(cached));
      }

      const dbAvailability = await employeeAvailabilityService.getAvailabilityByEmployeeId(employeeId);
      if (dbAvailability && Object.keys(dbAvailability).length > 0) {
        setAvailability(dbAvailability);
        localStorage.setItem(cacheKey, JSON.stringify(dbAvailability));
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!employeeId) {
      toast.error('Unable to save availability: employee ID not resolved yet. Wait and retry.');
      return;
    }

    try {
      setSaving(true);
      const result = await employeeAvailabilityService.setAvailabilityForEmployee(employeeId, availability);

      if (result.success) {
        localStorage.setItem(`availability-${user.id}`, JSON.stringify(availability));
        toast.success('✓ Availability saved successfully');
        return;
      }

      // Explicit errors from Supabase path
      const message = result.error || 'Failed to save availability';
      console.error('Save error:', message);
      toast.error(`Failed to save availability: ${message}`);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(`Error saving availability: ${error?.message || String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(`availability-${user.id}`);
    setAvailability({
      Monday: { available: true, startTime: '09:00', endTime: '17:00' },
      Tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      Wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      Thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      Friday: { available: true, startTime: '09:00', endTime: '17:00' },
      Saturday: { available: false, startTime: '09:00', endTime: '17:00' },
      Sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    });
    toast.info('Reset to defaults');
  };

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center' }}>Loading availability...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(availability).map(([day, times]) => (
        <div key={day} className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{day}</div>
              <div className="subtle" style={{ marginTop: 4 }}>
                {times.available ? 'Available' : 'Not available'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
              <input
                type="checkbox"
                checked={times.available}
                onChange={(e) => handleDayChange(day, 'available', e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
              <label style={{ cursor: 'pointer', userSelect: 'none' }}>
                Available
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, minWidth: 180 }}>
              <input
                type="time"
                value={times.startTime}
                onChange={(e) => handleDayChange(day, 'startTime', e.target.value)}
                disabled={!times.available}
                style={{
                  padding: 8,
                  border: '1px solid var(--border, #ddd)',
                  borderRadius: 6,
                  fontSize: 14,
                  opacity: times.available ? 1 : 0.5
                }}
              />
              <span style={{ lineHeight: '32px' }}>–</span>
              <input
                type="time"
                value={times.endTime}
                onChange={(e) => handleDayChange(day, 'endTime', e.target.value)}
                disabled={!times.available}
                style={{
                  padding: 8,
                  border: '1px solid var(--border, #ddd)',
                  borderRadius: 6,
                  fontSize: 14,
                  opacity: times.available ? 1 : 0.5
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="button"
          className="iconBtn"
          onClick={handleReset}
          style={{ background: '#f3f4f6', color: '#666' }}
        >
          Reset to Default
        </button>
        <button
          type="button"
          className="iconBtn"
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#228B22', color: 'white' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AvailabilityEditor;
