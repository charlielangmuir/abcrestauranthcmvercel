import { supabase } from './supabaseClient';

const REQUESTS_TABLE = 'reimbursement_requests';
const CATEGORIES_TABLE = 'reimbursement_categories';

const formatStatus = (value) => {
  if (!value) return 'Pending';
  const normalized = String(value).trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeReimbursement = (item) => ({
  ...item,
  reimbursement_id: item?.reimbursement_id,
  description: item?.description || '',
  amount: Number(item?.amount || 0),
  date: item?.expense_date || item?.created_at || '',
  category: item?.reimbursement_categories?.category_name || null,
  category_id: item?.category_id ?? item?.reimbursement_categories?.category_id ?? null,
  receipt_url: item?.receipt_url || null,
  status: formatStatus(item?.status),
});

export const reimbursementService = {
  getCategories: async () => {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select('category_id, category_name, description, requires_receipt')
      .order('category_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getByEmployeeId: async (employeeId) => {
    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .select(`
        *,
        employees (
          employee_id,
          users ( first_name, last_name )
        ),
        reimbursement_categories (
          category_id,
          category_name,
          description,
          requires_receipt
        )
      `)
      .eq('employee_id', employeeId)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeReimbursement);
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .select(`
        *,
        employees (
          employee_id,
          users ( first_name, last_name )
        ),
        reimbursement_categories (
          category_id,
          category_name,
          description,
          requires_receipt
        )
      `)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeReimbursement);
  },

  create: async (payload) => {
    const categoryName = payload.category;
    let categoryId = payload.categoryId ?? null;

    if (!categoryId && categoryName) {
      const { data: category, error: categoryError } = await supabase
        .from(CATEGORIES_TABLE)
        .select('category_id')
        .eq('category_name', categoryName)
        .single();

      if (categoryError) throw categoryError;
      categoryId = category?.category_id ?? null;
    }

    const insertPayload = {
      employee_id: payload.employee_id,
      category_id: categoryId,
      amount: payload.amount,
      expense_date: payload.date,
      description: payload.description,
      receipt_url: payload.receiptUrl || null,
      status: (payload.status || 'Pending').toLowerCase(),
    };

    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .insert(insertPayload)
      .select(`
        *,
        reimbursement_categories (
          category_id,
          category_name,
          description,
          requires_receipt
        )
      `)
      .single();

    if (error) throw error;
    return normalizeReimbursement(data);
  },

  updateStatus: async (id, status) => {
    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .update({
        status: status.toLowerCase(),
      })
      .eq('reimbursement_id', id)
      .select(`
        *,
        reimbursement_categories (
          category_id,
          category_name,
          description,
          requires_receipt
        )
      `)
      .single();

    if (error) throw error;
    return normalizeReimbursement(data);
  },

  delete: async (id) => {
    const { error } = await supabase
      .from(REQUESTS_TABLE)
      .delete()
      .eq('reimbursement_id', id);

    if (error) throw error;
  },
};
