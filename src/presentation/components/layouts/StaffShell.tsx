'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ReactNode } from 'react';

type IconName = 'home' | 'calendar' | 'id' | 'arrows' | 'battery' | 'chart';

function NavIcon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-9z" /></svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case 'id':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 10h6M7 13h4" />
        </svg>
      );
    case 'arrows':
      return (
        <svg {...common}>
          <path d="M8 7l-4 4 4 4" />
          <path d="M16 17l4-4-4-4" />
          <path d="M4 11h16" />
        </svg>
      );
    case 'battery':
      return (
        <svg {...common}>
          <rect x="5" y="7" width="12" height="10" rx="2" />
          <rect x="17" y="10" width="2" height="4" rx="1" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M6 13h3v6H6zM11 9h3v10h-3zM16 5h3v14h-3z" />
        </svg>
      );
    default:
      return null;
  }
}

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboardstaff', label: 'Dashboard', icon: 'home' },
  { href: '/reservations', label: 'Reservations', icon: 'calendar' },
  { href: '/check-in', label: 'Check-in', icon: 'id' },
  { href: '/swap', label: 'Swap', icon: 'arrows' },
  { href: '/inventory', label: 'Inventory', icon: 'battery' },
  { href: '/reports', label: 'Reports', icon: 'chart' },
];

export function StaffShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9FF] to-[#F3F6FB]">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur ring-1 ring-gray-200/70 hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200/80">
          <Image src="/logo.png" alt="logo" width={28} height={28} />
          <div className="font-semibold tracking-wide text-gray-900">Staff</div>
        </div>
        <nav className="p-3 space-y-1 overflow-auto">
          {navItems.map((item) => {
            const isDashboard = item.href === '/dashboardstaff';
            // Active rule: highlight only the clicked function. Dashboard active only on exact '/dashboardstaff'.
            const active = isDashboard
              ? pathname === '/dashboardstaff'
              : pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'text-[#0B5FFF] bg-[#EAF2FF] ring-1 ring-[#D6E6FF]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="shrink-0 flex items-center justify-center">
                  <NavIcon name={item.icon} className={active ? 'text-[#0B5FFF]' : 'text-gray-500'} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="h-16 bg-white/90 backdrop-blur ring-1 ring-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="font-semibold tracking-wide text-gray-900">{title || 'Staff'}</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition" aria-label="notifications" />
            <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-gray-200">
              <Image src="/logo.png" alt="avatar" width={36} height={36} />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
