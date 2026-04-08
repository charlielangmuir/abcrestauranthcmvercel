import { supabase } from './supabaseClient';

export const payrollService = {
  async calculatePayrollFromTimeLogs(startDate, endDate) {
    try {
      // Fetch all time_entries for the date range
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('*')
        .gte('clock_in', `${startDate}T00:00:00`)
        .lte('clock_in', `${endDate}T23:59:59`);

      if (error) {
        throw error;
      }

      if (!timeEntries || timeEntries.length === 0) {
        return [];
      }

      // Get all employees with user info
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select(`
          employee_id,
          user_id,
          department,
          hourly_rate,
          salary,
          users (
            user_id,
            first_name,
            last_name,
            email
          )
        `);

      if (empError) {
        throw empError;
      }

      // Build a map for employee_id -> employee details
      const employeeMap = {};
      if (employees) {
        employees.forEach((emp) => {
          employeeMap[emp.employee_id] = emp;
        });
      }

      // Calculate payroll by employee
      const earningsByEmployee = {};

      timeEntries.forEach((entry) => {
        if (!entry.clock_in || !entry.clock_out) return; // Skip incomplete entries

        const empId = entry.employee_id;
        const employee = employeeMap[empId];

        if (!employee) return; // Skip if employee not found

        const clockInTime = new Date(entry.clock_in);
        const clockOutTime = new Date(entry.clock_out);

        // Calculate hours worked
        const diffMs = clockOutTime - clockInTime;
        const hours = Math.max(0, diffMs / (1000 * 60 * 60));

        if (hours <= 0) return; // Skip zero-hour entries

        // Get hourly rate
        const hourly = employee.hourly_rate
          ? parseFloat(employee.hourly_rate)
          : employee.salary
          ? parseFloat(employee.salary) / 2080
          : 0;

        const wage = hours * (isNaN(hourly) ? 0 : hourly);

        if (!earningsByEmployee[empId]) {
          earningsByEmployee[empId] = {
            employeeId: empId,
            name: `${employee.users?.first_name || 'Unknown'} ${employee.users?.last_name || ''}`.trim() || 'Unknown',
            department: employee.department || '—',
            hourlyRate: hourly,
            totalHours: 0,
            totalPay: 0,
          };
        }

        earningsByEmployee[empId].totalHours += hours;
        earningsByEmployee[empId].totalPay += wage;
      });

      // Format and sort records
      const records = Object.values(earningsByEmployee)
        .map((r) => ({
          ...r,
          totalHours: Number(r.totalHours.toFixed(2)),
          totalPay: Number(r.totalPay.toFixed(2)),
        }))
        .sort((a, b) => b.totalPay - a.totalPay);

      return records;
    } catch (error) {
      console.error('Error calculating payroll from time entries:', error);
      throw error;
    }
  },
};
