/**
 * Simple toast notification utility
 * Can be replaced with sonner or other toast library later
 */

export const toast = {
  success: (message: string) => {
    console.log('[SUCCESS]', message);
    // TODO: Replace with actual toast component
    if (typeof window !== 'undefined') {
      alert(`✅ ${message}`);
    }
  },
  error: (message: string) => {
    console.error('[ERROR]', message);
    // TODO: Replace with actual toast component
    if (typeof window !== 'undefined') {
      alert(`❌ ${message}`);
    }
  },
  info: (message: string) => {
    console.info('[INFO]', message);
    // TODO: Replace with actual toast component
    if (typeof window !== 'undefined') {
      alert(`ℹ️ ${message}`);
    }
  },
};
