import { supabase } from './supabaseClient';

export const shiftService = {
  async getShiftsByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          employees (
            employee_id,
            employee_number,
            job_title,
            department,
            users (
              user_id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Shifts table may not exist yet');
        return [];
      }
      throw error;
    }
  },

  async getShiftsByDate(date) {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          employees (
            employee_id,
            employee_number,
            job_title,
            department,
            users (
              user_id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('shift_date', date)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching shifts for date:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch shifts for date:', error);
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Shifts table may not exist yet');
        return [];
      }
      throw error;
    }
  },

  async create(shiftData) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw userError;
      }

      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          employee_id: shiftData.employee_id,
          shift_date: shiftData.shift_date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          break_duration: shiftData.break_duration || 0,
          position: shiftData.position || null,
          status: shiftData.status || 'scheduled',
          notes: shiftData.notes || null,
          created_by: userData.user?.id || null,
        }])
        .select(`
          *,
          employees (
            employee_id,
            employee_number,
            job_title,
            department,
            users (
              user_id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error creating shift:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create shift:', error);
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Shifts table does not exist. Please contact your administrator.');
      }
      throw error;
    }
  },

  async update(shiftId, shiftData) {
    try {
      const updateData = {};
      
      if (shiftData.employee_id !== undefined) updateData.employee_id = shiftData.employee_id;
      if (shiftData.shift_date !== undefined) updateData.shift_date = shiftData.shift_date;
      if (shiftData.start_time !== undefined) updateData.start_time = shiftData.start_time;
      if (shiftData.end_time !== undefined) updateData.end_time = shiftData.end_time;
      if (shiftData.break_duration !== undefined) updateData.break_duration = shiftData.break_duration;
      if (shiftData.position !== undefined) updateData.position = shiftData.position;
      if (shiftData.status !== undefined) updateData.status = shiftData.status;
      if (shiftData.notes !== undefined) updateData.notes = shiftData.notes;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('shifts')
        .update(updateData)
        .eq('shift_id', shiftId)
        .select(`
          *,
          employees (
            employee_id,
            employee_number,
            job_title,
            department,
            users (
              user_id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error updating shift:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update shift:', error);
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Shifts table does not exist. Please contact your administrator.');
      }
      throw error;
    }
  },

  async delete(shiftId) {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('shift_id', shiftId);

      if (error) {
        console.error('Error deleting shift:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete shift:', error);
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Shifts table does not exist. Please contact your administrator.');
      }
      throw error;
    }
  },

  async getShiftsByEmployee(employeeId, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          employees (
            employee_id,
            employee_number,
            job_title,
            department,
            users (
              user_id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('employee_id', employeeId);

      if (startDate) {
        query = query.gte('shift_date', startDate);
      }
      if (endDate) {
        query = query.lte('shift_date', endDate);
      }

      query = query.order('shift_date', { ascending: true })
                   .order('start_time', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employee shifts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch employee shifts:', error);
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Shifts table may not exist yet');
        return [];
      }
      throw error;
    }
  },
};