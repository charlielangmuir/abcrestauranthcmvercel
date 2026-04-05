// notificationService.js
import { supabase } from './supabaseClient';

export const notificationService = {
  /**
   * Get all notifications for a specific user
   * @param {string} userId
   * @param {boolean} unreadOnly - optional filter for unread notifications
   * @returns {Promise<Array>}
   */
  getAllByUser: async (userId, unreadOnly = false) => {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error in getAllByUser:', error);
      throw error;
    }
  },

  /**
   * Get a single notification by ID
   * @param {number} notificationId
   * @returns {Promise<Object>}
   */
  getById: async (notificationId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('notification_id', notificationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId
   * @returns {Promise<Object>}
   */
  markAsRead: async (notificationId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('notification_id', notificationId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  },

  /**
   * Create a new notification
   * @param {Object} notificationData
   * @returns {Promise<Object>}
   */
  create: async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {number} notificationId
   * @returns {Promise<void>}
   */
  delete: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('notification_id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },
};