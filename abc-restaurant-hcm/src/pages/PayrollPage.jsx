import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../api/employeeService';
import { shiftService } from '../api/shiftService';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const parseTimeToMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(':').map((n) => Number(n));
  return h * 60 + m;
};

const formatCurrency = (amount) => {
  return '$' + Number(amount || 0).toFixed(2);
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const hoursFromShift = (shift) => {
  const startMin = parseTimeToMinutes(shift.start_time);
  const endMin = parseTimeToMinutes(shift.end_time);
  if (isNaN(startMin) || isNaN(endMin) || endMin <= startMin) return 0;
  const breakMin = Number(shift.break_duration || 0);
  return Math.max(0, (endMin - startMin - breakMin) / 60);
};

const getShiftHours = (shift) => {
  // Prefer explicit actual hours if available, otherwise calculate from start/end times.
  if (shift.actual_hours !== undefined && shift.actual_hours !== null) {
    const actual = Number(shift.actual_hours);
    return isNaN(actual) ? 0 : actual;
  }

  if (shift.actual_start_time && shift.actual_end_time) {
    return hoursFromShift({
      start_time: shift.actual_start_time,
      end_time: shift.actual_end_time,
      break_duration: shift.break_duration,
    });
  }

  return hoursFromShift(shift);
};

const PayrollPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payrollSummary, setPayrollSummary] = useState({
    totalPayroll: 0,
    employeesPaid: 0,
    nextPayDate: '',
  });
  const [payrollRecords, setPayrollRecords] = useState([]);

  const getPeriodRange = () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return {
      startDate: `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`,
      endDate: `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`,
      nextPay: new Date(now.getFullYear(), now.getMonth(), 15),
    };
  };

  const calculatePayroll = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?.user_metadata?.role || user.user_metadata.role.toUpperCase() !== 'ADMIN') {
        toast.error('Payroll processing is admin-only.');
        setPayrollSummary((s) => ({ ...s, nextPayDate: formatDate(new Date()) }));
        setPayrollRecords([]);
        return;
      }

      const period = getPeriodRange();
      const employees = await employeeService.getAll(true);
      const shifts = await shiftService.getShiftsByDateRange(period.startDate, period.endDate);

      const earningsByEmployee = {};

      shifts.forEach((shift) => {
        const empId = shift.employee_id;
        if (!empId) return;
        const hours = getShiftHours(shift);
        if (hours <= 0) return;

        const fullEmployee = employees.find((e) => e.employee_id === empId);
        const emp = {
          ...(fullEmployee || {}),
          ...(shift.employees || {}),
        };
        const rawHourly = emp?.hourly_rate ?? emp?.hourlyRate ?? 0;
        const hourly = rawHourly ? parseFloat(rawHourly) : emp?.salary ? parseFloat(emp.salary) / 2080 : 0;

        const wage = hours * (isNaN(hourly) ? 0 : hourly);

        if (!earningsByEmployee[empId]) {
          earningsByEmployee[empId] = {
            employeeId: empId,
            name: `${emp?.users?.first_name || 'Unknown'} ${emp?.users?.last_name || ''}`.trim() || 'Unknown',
            department: emp?.department || '—',
            hourlyRate: hourly,
            hourlyLimit: emp?.hourly_limit ?? emp?.hourlyLimit ?? 0,
            totalHours: 0,
            totalPay: 0,
          };
        }

        earningsByEmployee[empId].totalHours += hours;
        earningsByEmployee[empId].totalPay += wage;
      });

      const records = Object.values(earningsByEmployee)
        .map((r) => ({
          ...r,
          totalHours: Number(r.totalHours.toFixed(2)),
          totalPay: Number(r.totalPay.toFixed(2)),
        }))
        .sort((a, b) => b.totalPay - a.totalPay);

      const totalPayroll = records.reduce((sum, rec) => sum + rec.totalPay, 0);
      const employeesPaid = records.filter((rec) => rec.totalPay > 0).length;
      const nextPayDate = new Date();
      nextPayDate.setDate(nextPayDate.getDate() + 14);

      setPayrollRecords(records);
      setPayrollSummary({
        totalPayroll,
        employeesPaid,
        nextPayDate: formatDate(nextPayDate),
      });
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast.error('Failed to calculate payroll.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleProcessPayroll = async () => {
  if (!user?.user_metadata?.role || user.user_metadata.role.toUpperCase() !== 'ADMIN') {
    toast.error('Only admin can process payroll.');
    return;
  }

  setProcessing(true);
  try {
    await calculatePayroll();

    // Build worksheet data
    const period = getPeriodRange();

    const headers = ['Employee', 'Department', 'Hours Worked', 'Hourly Rate', 'Hourly Limit', 'Net Pay'];

    const rows = payrollRecords.map((rec) => [
      rec.name,
      rec.department,
      rec.totalHours,
      rec.hourlyRate,
      rec.hourlyLimit || 0,
      rec.totalPay,
    ]);

    const totalsRow = [
      'TOTAL',
      '',
      payrollRecords.reduce((sum, r) => sum + r.totalHours, 0).toFixed(2),
      '',
      '',
      payrollRecords.reduce((sum, r) => sum + r.totalPay, 0).toFixed(2),
    ];

    const wsData = [headers, ...rows, totalsRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 28 }, // Employee
      { wch: 18 }, // Department
      { wch: 14 }, // Hours
      { wch: 14 }, // Rate
      { wch: 14 }, // Hourly Limit
      { wch: 14 }, // Net Pay
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');

    const fileName = `Payroll_${period.startDate}_to_${period.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success('Payroll processed and downloaded successfully.');
  } catch (error) {
    console.error('Payroll processing failed:', error);
    toast.error('Payroll processing failed.');
  } finally {
    setProcessing(false);
  }
};

  useEffect(() => {
    calculatePayroll();
  }, [user, calculatePayroll]);

  return (
    <div className="container" style={{ paddingTop: 10, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 className="pageTitle">Payroll</h1>
          <p className="subtle">Manage employee compensation and pay periods</p>
        </div>

        <button
          type="button"
          className="iconBtn"
          onClick={handleProcessPayroll}
          disabled={processing}
          style={{
            background: '#16a34a',
            color: 'white',
            fontWeight: 700,
            padding: '10px 16px',
          }}
        >
          {processing ? 'Processing...' : 'Process Payroll'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Total Payroll (This Month)</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{formatCurrency(payrollSummary.totalPayroll)}</div>
          <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>
            {payrollSummary.totalPayroll >= 0 ? 'Calculated from shifts' : ''}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Employees Paid</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{payrollSummary.employeesPaid}</div>
          <div className="subtle" style={{ marginTop: 6 }}>Active employees paid this period</div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Next Pay Date</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{payrollSummary.nextPayDate}</div>
          <div className="subtle" style={{ marginTop: 6 }}>Planned date to finalize next payroll</div>
        </div>
      </div>

      <div className="card">
        <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border, #ddd)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>Recent Payroll Records</h2>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Period {getPeriodRange().startDate} to {getPeriodRange().endDate}</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading payroll data...</div>
        ) : payrollRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <svg
              style={{ width: 64, height: 64, color: 'var(--muted)', margin: '0 auto 16px' }}
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No payroll records for the period</div>
            <div className="subtle" style={{ fontSize: 14 }}>Press Process Payroll to generate records.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: 380 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #ddd' }}>Employee</th>
                  <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>Hours</th>
                  <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>Rate</th>
                  <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>Hourly Limit</th>
                  <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #ddd' }}>Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((rec) => (
                  <tr key={rec.employeeId}>
                    <td style={{ padding: 10, borderBottom: '1px solid #f3f3f3' }}>{rec.name || `ID:${rec.employeeId}`}</td>
                    <td style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #f3f3f3' }}>{rec.totalHours}</td>
                    <td style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #f3f3f3' }}>{formatCurrency(rec.hourlyRate)}</td>
                    <td style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #f3f3f3' }}>{rec.hourlyLimit ? `${rec.hourlyLimit} h` : '—'}</td>
                    <td style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid #f3f3f3', fontWeight: 700 }}>{formatCurrency(rec.totalPay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
