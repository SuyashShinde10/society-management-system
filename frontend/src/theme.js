// -------------------------------------------------------
// Shared design tokens — import this in every component
// instead of declaring a local `theme` object.
// -------------------------------------------------------
export const theme = {
  bg: 'var(--theme-bg, #F9F8F3)', // Warm Cream
  surface: 'var(--theme-surface, #FFFDF9)', // Soft Alabaster
  textMain: 'var(--theme-text-main, #2C2C2C)', // Deep Charcoal
  textSec: 'var(--theme-text-sec, #5A5A5A)', // Muted Gray, darkened for WCAG AA contrast
  border: 'var(--theme-border, #E8E4D9)', // Soft organic border
  accent: 'var(--theme-accent, #D9734E)', // Terracotta
  fieldBg: 'var(--theme-field-bg, #F2F0E6)', // Very soft beige for inputs
  resolved: 'var(--theme-resolved, #6B705C)', // Muted Olive
  declined: 'var(--theme-declined, #C05746)', // Muted Red
  pending: 'var(--theme-pending, #D4A373)', // Muted Mustard
  danger: 'var(--theme-danger, #C05746)',
};

export default theme;
