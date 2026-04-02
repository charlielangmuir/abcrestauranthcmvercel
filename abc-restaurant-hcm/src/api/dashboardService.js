import { supabase } from './supabaseClient';

export const dashboardService = {
  async getMonthlySchedule(userId, year, month) {
    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('user_id', userId)
        .single();

      if (employeeError || !employeeData) {
        console.error('Error fetching employee:', employeeError);
        return { shifts: [], timeOffRequests: [] };
      }

      const employeeId = employeeData.employee_id;

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayStr = formatDate(firstDay);
      const lastDayStr = formatDate(lastDay);

      let shifts = [];
      try {
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .eq('employee_id', employeeId)
          .gte('shift_date', firstDayStr)
          .lte('shift_date', lastDayStr)
          .order('shift_date', { ascending: true });

        if (!shiftsError && shiftsData) {
          shifts = shiftsData;
        }
      } catch (error) {
        console.warn('Could not fetch shifts');
      }

      let timeOffRequests = [];
      try {
        const { data: timeOffData, error: timeOffError } = await supabase
          .from('time_off_requests')
          .select('*')
          .eq('employee_id', employeeId)
          .or(`and(start_date.lte.${lastDayStr},end_date.gte.${firstDayStr})`)
          .in('status', ['pending', 'approved']);

        if (!timeOffError && timeOffData) {
          timeOffRequests = timeOffData;
        }
      } catch (error) {
        console.warn('Could not fetch time-off requests');
      }

      return { shifts, timeOffRequests };
    } catch (error) {
      console.error('Error fetching monthly schedule:', error);
      return { shifts: [], timeOffRequests: [] };
    }
  },

  async getEmployeeStats(userId) {
    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('user_id', userId)
        .single();

      if (employeeError) {
        console.error('Error fetching employee:', employeeError);
        throw employeeError;
      }

      if (!employeeData) {
        console.warn('No employee record found for user');
        return {
          upcomingShifts: 0,
          hoursThisWeek: 0,
          pendingRequests: 0,
          unreadNotifications: 0,
          recentShifts: [],
        };
      }

      const employeeId = employeeData.employee_id;

      const today = new Date();
      const todayStr = formatDate(today);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = formatDate(nextWeek);

      const weekStart = getWeekStart(today);
      const weekEnd = getWeekEnd(today);
      const weekStartStr = formatDate(weekStart);
      const weekEndStr = formatDate(weekEnd);

      let upcomingShifts = 0;
      let upcomingShiftList = [];
      try {
        const { data: upcomingData, error: upcomingError, count } = await supabase
          .from('shifts')
          .select('*', { count: 'exact' })
          .eq('employee_id', employeeId)
          .gte('shift_date', todayStr)
          .lte('shift_date', nextWeekStr)
          .eq('status', 'scheduled')
          .order('shift_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5);

        if (!upcomingError) {
          upcomingShifts = count || 0;
          upcomingShiftList = upcomingData || [];
        }
      } catch (error) {
        console.warn('Shifts table may not exist yet');
      }

      let hoursThisWeek = 0;
      try {
        const { data: weekShifts, error: weekError } = await supabase
          .from('shifts')
          .select('start_time, end_time')
          .eq('employee_id', employeeId)
          .gte('shift_date', weekStartStr)
          .lte('shift_date', weekEndStr);

        if (!weekError && weekShifts) {
          hoursThisWeek = weekShifts.reduce((total, shift) => {
            return total + calculateHours(shift.start_time, shift.end_time);
          }, 0);
        }
      } catch (error) {
        console.warn('Could not calculate hours this week');
      }

      let pendingRequests = 0;
      try {
        const { error: requestsError, count } = await supabase
          .from('time_off_requests')
          .select('*', { count: 'exact' })
          .eq('employee_id', employeeId)
          .eq('status', 'pending');

        if (!requestsError) {
          pendingRequests = count || 0;
        }
      } catch (error) {
        console.warn('Time off requests table may not exist yet');
      }

      let unreadNotifications = 0;
      try {
        const { error: notifError, count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (!notifError) {
          unreadNotifications = count || 0;
        }
      } catch (error) {
        console.warn('Notifications table may not exist yet');
      }

      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = formatDate(lastWeek);

      let recentShifts = [];
      try {
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .eq('employee_id', employeeId)
          .gte('shift_date', lastWeekStr)
          .lte('shift_date', todayStr)
          .order('shift_date', { ascending: false })
          .order('start_time', { ascending: false })
          .limit(5);

        if (!shiftsError && shiftsData) {
          recentShifts = shiftsData;
        }
      } catch (error) {
        console.warn('Could not fetch recent shifts');
      }

      return {
        upcomingShifts,
        upcomingShiftList,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        pendingRequests,
        unreadNotifications,
        recentShifts,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        upcomingShifts: 0,
        hoursThisWeek: 0,
        pendingRequests: 0,
        unreadNotifications: 0,
        recentShifts: [],
      };
    }
  },

  async getClockStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('id, user_id, clock_in, clock_out, created_at')
        .eq('user_id', userId)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching clock status:', error);
        return { isClockedIn: false, activeEntry: null, lastClockOut: null };
      }

      const { data: lastEntry, error: lastEntryError } = await supabase
        .from('time_logs')
        .select('clock_out')
        .eq('user_id', userId)
        .not('clock_out', 'is', null)
        .order('clock_out', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastEntryError) {
        console.error('Error fetching last clock out:', lastEntryError);
      }

      return {
        isClockedIn: !!data,
        activeEntry: data || null,
        lastClockOut: lastEntry?.clock_out || null,
      };
    } catch (error) {
      console.error('Error fetching clock status:', error);
      return { isClockedIn: false, activeEntry: null, lastClockOut: null };
    }
  },

  async clockIn(userId) {
    try {
      const { data: existingEntry, error: existingError } = await supabase
        .from('time_logs')
        .select('id')
        .eq('user_id', userId)
        .is('clock_out', null)
        .limit(1)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingEntry) {
        return { success: false, message: 'User is already clocked in.' };
      }

      const { data, error } = await supabase
        .from('time_logs')
        .insert([
          {
            user_id: userId,
            clock_in: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error clocking in:', error);
      return { success: false, message: error.message || 'Failed to clock in.' };
    }
  },

  async clockOut(userId) {
    try {
      const { data: activeEntry, error: fetchError } = await supabase
        .from('time_logs')
        .select('id')
        .eq('user_id', userId)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!activeEntry) {
        return { success: false, message: 'No active clock-in found.' };
      }

      const { data, error } = await supabase
        .from('time_logs')
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq('id', activeEntry.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error clocking out:', error);
      return { success: false, message: error.message || 'Failed to clock out.' };
    }
  },
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  return new Date(d.setDate(diff));
}

function calculateHours(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const diffMinutes = endMinutes - startMinutes;
  return diffMinutes / 60;
}