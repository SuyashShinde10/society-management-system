import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * FormError: Standardized inline field error component.
 * Replaces generic toast-only error reporting with precise, accessible field-level error messages.
 */
export const FormError = ({ error, id }) => {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      className="text-xs text-rose-600 mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <AlertCircle size={13} className="shrink-0 text-rose-500" />
      <span>{error}</span>
    </p>
  );
};

export default FormError;
