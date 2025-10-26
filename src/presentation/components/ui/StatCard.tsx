import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: "default" | "warning" | "success";
  icon: React.ReactNode;
  bgColor?: string;
}

const getValueColorClass = (color: string) => {
  switch (color) {
    case "warning":
      return "text-[#F59E0B]";
    case "success":
      return "text-[#3DAD10]";
    default:
      return "text-[#1E1E1E]";
  }
};

export default function StatCard({
  title,
  value,
  subtitle,
  valueColor = "default",
  icon,
  bgColor = "bg-gray-100",
}: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative">
      <h4 className="text-sm font-medium text-[#B3B3B3] mb-2">{title}</h4>
      <p
        className={`text-3xl font-bold mb-4 ${getValueColorClass(valueColor)}`}
      >
        {value}
      </p>
      {subtitle && (
        <div
          className={`flex items-center space-x-2 text-sm ${getValueColorClass(
            valueColor
          )}`}
        >
          {icon}
          <span>{subtitle}</span>
        </div>
      )}
      <div
        className={`absolute bottom-6 right-6 w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  );
}
