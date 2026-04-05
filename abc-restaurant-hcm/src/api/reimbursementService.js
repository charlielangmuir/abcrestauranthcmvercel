import { supabase } from './supabaseClient';

export const reimbursementService = {
  /**
   * Get reimbursements submitted by a specific employee
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getByEmployeeId: async (employeeId) => {
    const { data, error } = await supabase
      .from('reimbursements')
      .select(`
        *,
        employees (
          employee_id,
          users ( first_name, last_name )
        )
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all reimbursements (manager / admin view)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('reimbursements')
      .select(`
        *,
        employees (
          employee_id,
          users ( first_name, last_name )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new reimbursement request
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  create: async (payload) => {
    const { data, error } = await supabase
      .from('reimbursements')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update the status of a reimbursement (Approved / Rejected / Paid)
   * @param {number} id  reimbursement_id
   * @param {string} status
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status, notes = '') => {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
      .from('reimbursements')
      .update(updates)
      .eq('reimbursement_id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a reimbursement request (employee can delete their own Pending requests)
   * @param {number} id  reimbursement_id
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    const { error } = await supabase
      .from('reimbursements')
      .delete()
      .eq('reimbursement_id', id);

    if (error) throw error;
  },
};
