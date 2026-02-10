import { supabase } from './supabaseClient';

export const employeeService = {
  /**
   * Get all employees with their user information
   * @param {boolean} activeOnly - Filter for active employees only
   * @returns {Promise<Array>}
   */
  getAll: async (activeOnly = false) => {
    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          users (
            *,
            user_roles (*)
          )
        `)
        .order('employee_number', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched employees:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  /**
   * Get employee by ID
   * @param {number} employeeId
   * @returns {Promise<Object>}
   */
  getById: async (employeeId) => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users (
          *,
          user_roles (*)
        )
      `)
      .eq('employee_id', employeeId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new employee
   * @param {Object} employeeData
   * @returns {Promise<Object>}
   */
  create: async (employeeData) => {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select(`
        *,
        users (
          *,
          user_roles (*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update employee
   * @param {number} employeeId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  update: async (employeeId, updates) => {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', employeeId)
      .select(`
        *,
        users (
          *,
          user_roles (*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deactivate employee (soft delete)
   * @param {number} employeeId
   * @returns {Promise<Object>}
   */
  deactivate: async (employeeId) => {
    const { data, error } = await supabase
      .from('employees')
      .update({
        is_active: false,
        termination_date: new Date().toISOString().split('T')[0], // Date only
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', employeeId)
      .select(`
        *,
        users (
          *,
          user_roles (*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Permanently delete employee
   * @param {number} employeeId
   * @returns {Promise<void>}
   */
  delete: async (employeeId) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('employee_id', employeeId);

    if (error) throw error;
  },

  /**
   * Search employees
   * @param {string} searchTerm
   * @returns {Promise<Array>}
   */
  search: async (searchTerm) => {
    // Get all employees first, then filter client-side
    // This is simpler than complex Supabase queries with nested OR
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        users (
          *,
          user_roles (*)
        )
      `);

    if (error) throw error;

    // Filter client-side
    const search = searchTerm.toLowerCase();
    return data.filter(emp => {
      const fullName = `${emp.users?.first_name || ''} ${emp.users?.last_name || ''}`.toLowerCase();
      const email = (emp.users?.email || '').toLowerCase();
      const jobTitle = (emp.job_title || '').toLowerCase();
      const department = (emp.department || '').toLowerCase();
      const employeeNumber = (emp.employee_number || '').toLowerCase();

      return fullName.includes(search) ||
             email.includes(search) ||
             jobTitle.includes(search) ||
             department.includes(search) ||
             employeeNumber.includes(search);
    });
  },
};