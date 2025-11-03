'use client';

import { ReactNode } from 'react';

type Props = {
  title: string;
  value: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  titleClassName?: string;
  valueClassName?: string;
  footerClassName?: string;
};

export function StatCard({ title, value, footer, icon, titleClassName, valueClassName, footerClassName }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-start gap-4">
      {icon && (
        <div className="h-10 w-10 rounded-lg bg-[#E6F0FF] flex items-center justify-center text-[#0062FF]">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className={`text-sm text-gray-500 ${titleClassName || ''}`}>{title}</div>
        <div className={`text-2xl font-semibold mt-1 ${valueClassName || ''}`}>{value}</div>
        {footer && <div className={`text-xs text-gray-500 mt-2 ${footerClassName || ''}`}>{footer}</div>}
      </div>
    </div>
  );
}
