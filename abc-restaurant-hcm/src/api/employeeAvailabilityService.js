import { supabase } from './supabaseClient';

const dayMapping = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0
};

const reverseDayMapping = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

export const employeeAvailabilityService = {
  async getAvailabilityByEmployeeId(employeeId) {
    try {
      const { data, error } = await supabase
        .from('employee_availability')
        .select('*')
        .eq('employee_id', employeeId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      const availability = {};
      data.forEach(record => {
        const dayName = reverseDayMapping[record.day_of_week];
        availability[dayName] = {
          available: record.is_available,
          startTime: record.start_time ? record.start_time.substring(0, 5) : '09:00',
          endTime: record.end_time ? record.end_time.substring(0, 5) : '17:00'
        };
      });

      return availability;
    } catch (error) {
      console.error('Error fetching availability:', error);
      return {};
    }
  },

  async setAvailabilityForEmployee(employeeId, availability) {
    try {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      // Delete existing records
      const { error: deleteError } = await supabase
        .from('employee_availability')
        .delete()
        .eq('employee_id', employeeId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to clear existing availability: ${deleteError.message}`);
      }

      // Insert new records
      const records = Object.entries(availability).map(([day, times]) => ({
        employee_id: employeeId,
        day_of_week: dayMapping[day],
        is_available: times.available,
        start_time: times.available ? `${times.startTime}:00` : '00:00:00',
        end_time: times.available ? `${times.endTime}:00` : '00:00:00',
        effective_from: new Date().toISOString(),
        effective_to: null
      }));

      if (records.length === 0) {
        throw new Error('No availability records to save');
      }

      const { error: insertError, data } = await supabase
        .from('employee_availability')
        .insert(records)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to save availability: ${insertError.message}`);
      }

      console.log('Availability saved successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Error setting availability:', error);
      return { success: false, error: error.message };
    }
  }
};
