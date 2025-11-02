"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SideBar, { NavigationItem, UserInfo } from '@/presentation/components/common/SideBar';
import { CustomerSideBar } from '../(customer)/home/components';
import { ProfileLayout } from '@/presentation/components/ui/profile/ProfileLayout';
import { usePathname } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', path: '/dashboardstaff', icon: <></> },
    { name: 'Check-in', path: '/check-in', icon: <></> },
    { name: 'Inventory', path: '/inventory', icon: <></> },
    { name: 'Reports', path: '/reports', icon: <></> },
    { name: 'Reservations', path: '/reservations', icon: <></> },
    { name: 'Swap', path: '/swap', icon: <></> },
  ];

  const userInfo: UserInfo = {
    initials: user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'U',
    name: user?.name || user?.email || 'User',
    plan: user?.role || undefined,
    avatarUrl: user?.avatar,
  };

  // Render appropriate sidebar based on role (simple heuristic)
  const roleStr = (user?.role || '').toString().toLowerCase();
  const isEmployee = roleStr === 'staff' || roleStr === 'employee';

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {isEmployee ? (
        <SideBar
          isExpanded={isExpanded}
          currentPath={pathname || '/profile'}
          navigationItems={navigationItems}
          onToggle={() => setIsExpanded((p) => !p)}
          user={userInfo}
        />
      ) : (
        <CustomerSideBar currentPath={pathname || '/profile'} />
      )}

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 space-y-6 max-w-full overflow-x-auto">
          <ProfileLayout />
        </main>
      </div>
    </div>
  );
}
