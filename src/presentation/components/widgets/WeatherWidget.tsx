import React from "react";
import { WiDaySunny, WiCloud, WiRain } from "react-icons/wi";

export interface WeatherWidgetProps {
  temperature: string;
  condition: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  temperature,
  condition,
}) => {
  const renderWeatherIcon = () => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <WiDaySunny className="w-6 h-6 text-gray-800 stroke-[0.5]" />;
      case "cloudy":
        return <WiCloud className="w-6 h-6 text-gray-800 stroke-[0.5]" />;
      case "rainy":
        return <WiRain className="w-6 h-6 text-gray-800 stroke-[0.5]" />;
      default:
        return <WiDaySunny className="w-6 h-6 text-gray-800 stroke-[0.5]" />;
    }
  };

  return (
    <div className="bg-indigo-100 h-9 rounded-lg px-3 py-2 flex items-center">
      {renderWeatherIcon()}
      <span className="text-sm font-medium text-gray-800">{temperature}</span>
      <span className="text-sm font-medium text-gray-800">{condition}</span>
    </div>
  );
};

export default WeatherWidget;
