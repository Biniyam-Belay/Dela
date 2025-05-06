// Toast options for react-hot-toast (minimalist, modern, black/white/gray)
const TOASTER_OPTIONS = {
  style: {
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.98)',
    color: '#18181b',
    fontSize: '0.95rem',
    padding: '0.8rem 1.5rem',
    boxShadow: '0 2px 16px 0 rgba(24,24,27,0.08)',
    border: '1px solid #e5e7eb',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    letterSpacing: '0.01em',
    fontWeight: 400,
    fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
    minWidth: '160px',
    maxWidth: '90vw',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    boxSizing: 'border-box',
  },
  success: {
    style: {
      background: '#18181b',
      color: '#fff',
      border: '1px solid #18181b',
      boxShadow: '0 2px 16px 0 rgba(24,24,27,0.12)',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    iconTheme: {
      primary: '#18181b',
      secondary: '#fff',
    },
  },
  error: {
    style: {
      background: '#fff',
      color: '#18181b',
      border: '1px solid #18181b',
      boxShadow: '0 2px 16px 0 rgba(24,24,27,0.12)',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    iconTheme: {
      primary: '#18181b',
      secondary: '#fff',
    },
  },
};

export default TOASTER_OPTIONS;
