/**
 * Global Error Handler
 * Suppress console spam for expected errors
 */

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// List of error messages to suppress
const suppressedErrors = [
  'Session expired',
  'API Error: {}',
  'Request failed with status code 401',
  'Request failed with status code 404', // Not found - expected when no data
  'Failed to fetch bookings',
  'Failed to fetch batteries',
  'Failed to fetch battery inventory',
  '[AuthRepository] Logout error', // Logout errors are expected (backend might not have /logout endpoint)
  '/auth/logout', // Suppress logout endpoint errors
];

// Override console.error
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedErrors.some(pattern => 
    message.includes(pattern)
  );
  
  // Also suppress "[API Error] Object" logs
  if (message.includes('[API Error]') && message.includes('Object')) {
    return;
  }
  
  // Suppress use case errors (they're already handled)
  if (message.includes('UseCase] Error:')) {
    return;
  }
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

// Override console.warn for auth warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suppress auth-related warnings
  if (message.includes('[AuthContext]') && message.includes('Session expired')) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// Restore original methods on cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
}

export {};
