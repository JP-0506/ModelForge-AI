// /* ============================================================
//    authService.js — aligned with Node.js backend responses
//    ============================================================ */

// import api from './api';
// import { AUTH } from '../constants/apiEndpoints';
// import { storage } from '../utils/storage';

// const authService = {

//   // ── Register ──
//   register: async (formData) => {
//     // Backend expects: { fullName, email, phone, password, bio? }
//     const payload = {
//       fullName: formData.fullName,
//       email: formData.email,
//       phone: formData.phone,
//       password: formData.password,
//       ...(formData.bio ? { bio: formData.bio } : {}),
//     };
//     const response = await api.post(AUTH.REGISTER, payload);
//     // Returns: { success, message, data: { _id, fullName, email, phone, bio, ... } }
//     return response.data.data;
//   },

//   // ── Login ──
//   // Backend returns: { success, message, data: { token, user } }
//   login: async ({ email, password }) => {
//     const response = await api.post(AUTH.LOGIN, { email, password });
//     const { token, user } = response.data.data;

//     // Persist token and user
//     storage.setToken(token);
//     storage.setUser(user);

//     return { token, user };
//   },

//   // ── Logout ──
//   logout: async () => {
//     try {
//       await api.post(AUTH.LOGOUT);
//     } catch {
//       // Swallow server errors on logout — clean client state regardless
//     } finally {
//       storage.clearAuth();
//     }
//   },

//   // ── Get current user ──
//   getMe: async () => {
//     const response = await api.get('/api/users/me');
//     return response.data.data;
//   },

//   // ── Forgot Password (Request OTP) ──
//   forgotPassword: async (email) => {
//     const response = await api.post('/api/auth/forgot-password', { email });
//     return response.data;
//   },

//   // ── Verify OTP ──
//   verifyOTP: async (email, otp) => {
//     const response = await api.post('/api/auth/verify-otp', { email, otp });
//     return response.data;
//   },

//   // ── Reset Password ──
//   resetPassword: async (email, otp, newPassword) => {
//     const response = await api.post('/api/auth/reset-password', { email, otp, newPassword });
//     return response.data;
//   },
// };

// export default authService;

/* ============================================================
   authService.js — Authentication API Service
   ============================================================ */

import api from './api';
import { AUTH } from '../constants/apiEndpoints';
import { storage } from '../utils/storage';

const authService = {

  // ── Register ──
  register: async (formData) => {
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      ...(formData.bio ? { bio: formData.bio } : {}),
    };

    const response = await api.post(AUTH.REGISTER, payload);

    return response.data.data;
  },

  // ── Login ──
  login: async ({ email, password }) => {
    const response = await api.post(AUTH.LOGIN, {
      email,
      password,
    });

    const { token, user } = response.data.data;

    storage.setToken(token);
    storage.setUser(user);

    return { token, user };
  },

  // ── Logout ──
  logout: async () => {
    try {
      await api.post(AUTH.LOGOUT);
    } catch {
      // Even if backend logout fails,
      // clear authentication locally.
    } finally {
      storage.clearAuth();
    }
  },

  // ── Get Current User ──
  getMe: async () => {
    const response = await api.get('/users/me');

    return response.data.data;
  },

  // ── Forgot Password ──
  forgotPassword: async (email) => {
    const response = await api.post(AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // ── Verify OTP ──
  verifyOTP: async (email, otp) => {
    const response = await api.post(AUTH.VERIFY_OTP, {
      email,
      otp,
    });

    return response.data;
  },

  // ── Reset Password ──
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post(AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });

    return response.data;
  },
};

export default authService;
