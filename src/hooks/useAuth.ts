'use client';

// Re-export the useAuth hook from the AuthContext for backward compatibility
// This ensures existing code that imports useAuth from this path continues to work
export { useAuth } from '@/contexts/AuthContext';
