'use client';

import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import SideBar, { NavigationItem, UserInfo } from '@/presentation/components/common/SideBar';
import { HiHome, HiClipboardCheck, HiViewGrid, HiCalendar, HiArrowRight } from 'react-icons/hi';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems: NavigationItem[] = useMemo(
    () => [
      { name: 'Dashboard', path: '/dashboardstaff', icon: <HiHome size={18} /> },
      { name: 'Check-in & Swap', path: '/check-in', icon: <HiClipboardCheck size={18} /> },
      { name: 'Inventory', path: '/inventory', icon: <HiViewGrid size={18} /> },
      { name: 'Battery Transfers', path: '/battery-transfers', icon: <HiArrowRight size={18} /> },
      // Reports is Admin-only - Backend API returns 403 Forbidden for Staff/Employee
      // { name: 'Reports', path: '/reports', icon: <HiDocumentReport size={18} /> },
      { name: 'Reservations', path: '/reservations', icon: <HiCalendar size={18} /> },
      // Swap is now integrated into Check-in flow (removed from menu)
      // { name: 'Swap', path: '/swap', icon: <HiSwitchHorizontal size={18} /> },
    ],
    []
  );

  // Normalize role display: Staff/Employee -> Staff
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return 'Staff';
    const roleLower = role.toLowerCase();
    if (roleLower.includes('staff') || roleLower.includes('employee')) {
      return 'Staff';
    }
    return role;
  };

  // Get display name - prefer actual name, fallback to email, or empty
  const displayName = user?.name || user?.email || '';
  // Normalize role for plan display
  const displayRole = normalizeRole(user?.role);

  const userInfo: UserInfo = {
    initials: displayName ? displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'EM',
    name: displayName, // Only show if has name/email, no fallback
    plan: displayRole, // Normalize to 'Staff' for staff/employee roles
    avatarUrl: user?.avatar,
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <SideBar
        isExpanded={isExpanded}
        currentPath={pathname || '/dashboardstaff'}
        navigationItems={navigationItems}
        onToggle={() => setIsExpanded((prev) => !prev)}
        user={userInfo}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 space-y-6 max-w-full overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
