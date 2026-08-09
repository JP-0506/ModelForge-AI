/* ============================================================
   userService.js — User Profile & Security API Service
   ============================================================ */

import api from './api';
import { USER } from '../constants/apiEndpoints';

const userService = {
  // Get logged-in user profile
  getProfile: async () => {
    const res = await api.get(USER.PROFILE);
    return res.data.data;
  },

  // Update profile details (fullName, phone, bio)
  updateProfile: async (userData) => {
    const res = await api.put(USER.UPDATE_PROFILE, userData);
    return res.data.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const res = await api.put(USER.CHANGE_PASSWORD, passwordData);
    return res.data;
  },

  // Delete account (soft delete)
  deleteAccount: async () => {
    const res = await api.delete(USER.DELETE_ACCOUNT);
    return res.data;
  },
};

export default userService;
