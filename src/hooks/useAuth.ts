'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseAuthResult {
  isAuthenticated: boolean;
  token: string | null;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuth = (): UseAuthResult => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in localStorage when the component mounts
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const checkAuth = (): boolean => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsAuthenticated(false);
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    token,
    logout,
    checkAuth,
  };
};