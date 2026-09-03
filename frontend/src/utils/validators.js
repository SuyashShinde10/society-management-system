/**
 * Client-Side Validation Helpers for Society ERP
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required.';
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 13) {
    return 'Phone number must be between 10 and 13 digits.';
  }
  return null;
};

export const validateAmount = (amount, min = 1, max = 10000000) => {
  const num = Number(amount);
  if (isNaN(num)) return 'Amount must be a valid number.';
  if (num < min) return `Amount must be at least ₹${min}.`;
  if (num > max) return `Amount cannot exceed ₹${max.toLocaleString()}.`;
  return null;
};

export const validateRequiredText = (val, fieldName = 'Field', minLength = 2) => {
  if (!val || !val.trim()) return `${fieldName} is required.`;
  if (val.trim().length < minLength) return `${fieldName} must be at least ${minLength} characters.`;
  return null;
};

export const validateDueDate = (dueDate) => {
  if (!dueDate) return 'Due date is required.';
  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) return 'Please enter a valid date.';
  return null;
};
