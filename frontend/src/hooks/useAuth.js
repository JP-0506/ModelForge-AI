/* ============================================================
   useAuth Hook — Convenience wrapper for AuthContext
   ============================================================ */

import { useAuthContext } from '../context/AuthContext';

const useAuth = () => useAuthContext();

export default useAuth;
