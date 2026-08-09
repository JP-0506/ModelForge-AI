/* ============================================================
   Form Validators
   ============================================================ */

// ── Email ──
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// ── Password: min 8 chars, 1 uppercase, 1 number ──
export const isValidPassword = (password) => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);
};

// ── Name: at least 2 characters ──
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// ── Phone ──
export const isValidPhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return re.test(phone);
};

// ── Workspace/Project name ──
export const isValidWorkspaceName = (name) => {
  return name && name.trim().length >= 3 && name.trim().length <= 100;
};

// ── Validation rule builders for React Hook Form ──
export const validationRules = {
  email: {
    required: 'Email is required',
    validate: (val) => isValidEmail(val) || 'Enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    validate: (val) =>
      isValidPassword(val) ||
      'Password must contain at least one uppercase letter and one number',
  },
  confirmPassword: (getValues) => ({
    required: 'Please confirm your password',
    validate: (val) =>
      val === getValues('password') || 'Passwords do not match',
  }),
  firstName: {
    required: 'First name is required',
    minLength: { value: 2, message: 'First name must be at least 2 characters' },
    maxLength: { value: 50, message: 'First name must be less than 50 characters' },
  },
  lastName: {
    required: 'Last name is required',
    minLength: { value: 2, message: 'Last name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Last name must be less than 50 characters' },
  },
  workspaceName: {
    required: 'Workspace name is required',
    minLength: { value: 3, message: 'Name must be at least 3 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  projectName: {
    required: 'Project name is required',
    minLength: { value: 3, message: 'Name must be at least 3 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
};

export default validationRules;
