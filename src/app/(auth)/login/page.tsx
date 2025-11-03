'use client';

import { Suspense } from 'react';
// Auth-specific component now in (auth)/components
import { LoginLayout } from '../components/login/LoginLayout';

export default function LoginPage() {
  return <LoginLayout />;
}