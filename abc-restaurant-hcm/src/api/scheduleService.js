import { shiftService } from './shiftService';

const parseTimeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getShiftHours = (shift) => {
  const startMinutes = parseTimeToMinutes(shift.start_time);
  const endMinutes = parseTimeToMinutes(shift.end_time);

  if (endMinutes <= startMinutes) {
    return 0;
  }

  const breakMinutes = Number(shift.break_duration || 0);
  return Math.max(0, (endMinutes - startMinutes - breakMinutes) / 60);
};

const formatDateLabel = (date) => {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const getWeekRangeFromDate = (dateString) => {
  const current = new Date(`${dateString}T00:00:00`);
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - current.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startKey = startOfWeek.toISOString().split('T')[0];
  const endKey = endOfWeek.toISOString().split('T')[0];

  return {
    key: startKey,
    startDate: startKey,
    endDate: endKey,
    label: `Week of ${formatDateLabel(startOfWeek)} - ${formatDateLabel(endOfWeek)}`,
  };
};

export const scheduleService = {
  async generateWeeklyReport(startDate, endDate) {
    const shifts = await shiftService.getShiftsByDateRange(startDate, endDate);

    const weeklyMap = new Map();
    const employeeMap = new Map();
    const departmentMap = new Map();

    shifts.forEach((shift) => {
      const hours = getShiftHours(shift);
      const employee = shift.employees || {};
      const user = employee.users || {};
      const employeeId = shift.employee_id;
      const employeeName =
        `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Employee';
      const department = employee.department || 'Unassigned';
      const jobTitle = employee.job_title || 'No title';
      const weekRange = getWeekRangeFromDate(shift.shift_date);

      if (!weeklyMap.has(weekRange.key)) {
        weeklyMap.set(weekRange.key, {
          startDate: weekRange.startDate,
          endDate: weekRange.endDate,
          label: weekRange.label,
          shiftCount: 0,
          totalHours: 0,
          employees: new Set(),
        });
      }

      const weeklyEntry = weeklyMap.get(weekRange.key);
      weeklyEntry.shiftCount += 1;
      weeklyEntry.totalHours += hours;
      weeklyEntry.employees.add(employeeId);

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employeeId,
          name: employeeName,
          department,
          jobTitle,
          shiftCount: 0,
          totalHours: 0,
        });
      }

      const employeeEntry = employeeMap.get(employeeId);
      employeeEntry.shiftCount += 1;
      employeeEntry.totalHours += hours;

      if (!departmentMap.has(department)) {
        departmentMap.set(department, {
          department,
          employeeIds: new Set(),
          shiftCount: 0,
          totalHours: 0,
        });
      }

      const departmentEntry = departmentMap.get(department);
      departmentEntry.employeeIds.add(employeeId);
      departmentEntry.shiftCount += 1;
      departmentEntry.totalHours += hours;
    });

    const weeklySummary = Array.from(weeklyMap.values())
      .map((entry) => ({
        startDate: entry.startDate,
        endDate: entry.endDate,
        label: entry.label,
        shiftCount: entry.shiftCount,
        totalHours: Number(entry.totalHours.toFixed(2)),
        employeeCount: entry.employees.size,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    const employeeSummary = Array.from(employeeMap.values())
      .map((entry) => ({
        ...entry,
        totalHours: Number(entry.totalHours.toFixed(2)),
      }))
      .sort((a, b) => b.totalHours - a.totalHours || a.name.localeCompare(b.name));

    const departmentSummary = Array.from(departmentMap.values())
      .map((entry) => ({
        department: entry.department,
        employeeCount: entry.employeeIds.size,
        shiftCount: entry.shiftCount,
        totalHours: Number(entry.totalHours.toFixed(2)),
      }))
      .sort((a, b) => b.totalHours - a.totalHours || a.department.localeCompare(b.department));

    const totalHours = employeeSummary.reduce((sum, entry) => sum + entry.totalHours, 0);
    const totalShifts = shifts.length;

    return {
      period: {
        startDate,
        endDate,
      },
      generatedAt: new Date().toISOString(),
      totals: {
        totalShifts,
        totalHours: Number(totalHours.toFixed(2)),
        scheduledEmployees: employeeSummary.length,
        averageShiftLength: totalShifts > 0 ? Number((totalHours / totalShifts).toFixed(2)) : 0,
      },
      weeklySummary,
      employeeSummary,
      departmentSummary,
    };
  },
};
