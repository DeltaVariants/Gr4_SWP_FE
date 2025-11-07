import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  return (
    <nav className={`flex items-center text-sm text-gray-600 ${className}`}>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
      >
        <FaHome />
        <span>Dashboard</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            <FaChevronRight className="mx-2 text-gray-400 text-xs" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast ? "text-gray-900 font-medium" : "text-gray-600"
                }
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
