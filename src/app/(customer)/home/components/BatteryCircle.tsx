import React from "react";
import { FaBolt } from "react-icons/fa";

interface BatteryCircleProps {
  percentage: number;
}

function BatteryCircle({ percentage }: BatteryCircleProps) {
  // Tính toán góc quay (0-360 độ)
  const angle = (percentage / 100) * 360;

  // Xác định màu theo phần trăm pin
  const getColor = (perc: number) => {
    if (perc <= 10) return "#ef4444"; // red
    if (perc <= 40) return "#f59e0b"; // yellow/orange
    return "#10b981"; // green
  };

  const color = getColor(percentage);

  // Tọa độ cho SVG circle
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (angle / 360) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Vòng tròn nhỏ bên trong */}
      <svg className="absolute w-40 h-40" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#d1d5db" // gray-300
          strokeWidth="1"
        />
      </svg>

      {/* Vòng tròn progress */}
      <svg
        className="absolute w-40 h-40 transform -rotate-90"
        viewBox="0 0 140 140"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Icon lightning bolt */}
      <div className="absolute top-8 flex items-center justify-center">
        <FaBolt size={30} style={{ color }} />
      </div>

      {/* Phần trăm pin */}
      <div className="absolute text-center mt-6">
        <div className="text-3xl font-bold" style={{ color }}>
          {percentage}%
        </div>
        <div className="text-xs text-gray-500">Battery</div>
      </div>
    </div>
  );
}

export default BatteryCircle;
