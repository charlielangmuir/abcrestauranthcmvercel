
// src/api/authService.js
import { supabase } from './supabaseClient';

export const authService = {
  /**
   * login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{user, session}>}
   */
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    //supabase automatically stores session in localStorage
    //data.session contains the JWT token
    //data.user contains user information
    return {
      user: data.user,
      session: data.session,
      token: data.session.access_token,
    };
  },

  /**
   * register a new user
   * @param {string} email 
   * @param {string} password 
   * @param {object} metadata -additional user data (name, role, etc.)
   * @returns {Promise<{user, session}>}
   */
  register: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // example { full_name: 'John Doe', role: 'employee' }
      },
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * logout current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * get the current session
   * @returns {Promise<{session, user}>}
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  },

  /**
   * get the current user
   * @returns {Promise<{user}>}
   */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * check if user is authenticated (sync)
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const session = supabase.auth.getSession();
    return !!session;
  },

  /**
   * reset password request
   * @param {string} email 
   * @returns {Promise<void>}
   */
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * update password
   * @param {string} newPassword 
   * @returns {Promise<{user}>}
   */
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data.user;
  },

  /**
   * update user metadata
   * @param {object} updates 
   * @returns {Promise<{user}>}
   */
  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
    return data.user;
  },

  /**
   * listen to auth state changes
   * @param {function} callback -called when auth state changes
   * @returns {object} subscription object with unsubscribe method
   */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};