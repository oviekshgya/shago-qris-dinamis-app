export const API_BASE_URL =
  import.meta.env.VITE_QRIS_API_BASE_URL?.replace(/\/$/, '') || '';

export const API_DISPLAY_URL = API_BASE_URL || 'same-origin proxy (/api, /health)';
export const API_KEY = import.meta.env.VITE_QRIS_API_KEY || 'change-this-api-key';

export const shagoTheme = {
  colors: {
    red: '#EF4444',
    redDark: '#DC2626',
    black: '#0F172A',
    white: '#FFFFFF',
    gray: '#64748B',
  },
  gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
} as const;
