"use client";

import { withAuth } from '@/hoc/withAuth';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SideBar, { NavigationItem, UserInfo } from '@/presentation/components/common/SideBar';
import CustomerSideBar from '@/app/(customer)/home/components/CustomerSideBar';
import { ProfileLayout } from '@/presentation/components/ui/profile/ProfileLayout';
import { usePathname } from 'next/navigation';
import { HiHome, HiClipboardCheck, HiViewGrid, HiCalendar, HiArrowRight } from 'react-icons/hi';

export default withAuth(function ProfilePage() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Use same navigation items as EmployeeLayout for consistency
  const navigationItems: NavigationItem[] = useMemo(
    () => [
      { name: 'Dashboard', path: '/dashboardstaff', icon: <HiHome size={18} /> },
      { name: 'Check-in & Swap', path: '/check-in', icon: <HiClipboardCheck size={18} /> },
      { name: 'Inventory', path: '/inventory', icon: <HiViewGrid size={18} /> },
      { name: 'Battery Transfers', path: '/battery-transfers', icon: <HiArrowRight size={18} /> },
      { name: 'Reservations', path: '/reservations', icon: <HiCalendar size={18} /> },
    ],
    []
  );

  // Normalize role display: Staff/Employee -> Staff (same as EmployeeLayout)
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return 'Staff';
    const roleLower = role.toLowerCase();
    if (roleLower.includes('staff') || roleLower.includes('employee')) {
      return 'Staff';
    }
    return role;
  };

  // Get display name - prefer actual name, fallback to email (same as EmployeeLayout)
  const displayName = user?.name || user?.email || '';
  const displayRole = normalizeRole(user?.role);

  const userInfo: UserInfo = {
    initials: displayName ? displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'EM',
    name: displayName,
    plan: displayRole,
    avatarUrl: user?.avatar,
  };

  // Render appropriate sidebar based on role
  const roleStr = (user?.role || '').toString().toLowerCase();
  const isEmployee = roleStr === 'staff' || roleStr === 'employee';

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {isEmployee ? (
        <SideBar
          isExpanded={true}
          currentPath={pathname || '/profile'}
          navigationItems={navigationItems}
          onToggle={() => {}}
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
});
