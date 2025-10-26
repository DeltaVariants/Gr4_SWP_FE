import React from "react";
import WeatherWidget from "../widgets/WeatherWidget";

export interface WeatherInfo {
  temperature: string;
  condition: string;
}

export interface HeaderUIProps {
  title: string;
  subtitle: string;
  weather?: WeatherInfo;
  hasNotifications?: boolean;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export default function Header({
  title,
  subtitle,
  weather,
  hasNotifications = false,
  onNotificationClick,
  onSettingsClick,
  className = "",
}: HeaderUIProps) {
  return (
    <header
      className={`bg-white border-b border-gray-200 px-6 py-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1E1E]">{title}</h1>
          <p className="text-sm text-[#B3B3B3] mt-1">{subtitle}</p>
        </div>

        {/* Weather and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Weather Widget */}
          {weather && (
            <WeatherWidget
              temperature={weather.temperature}
              condition={weather.condition}
            />
          )}

          {/* Notification Icons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onNotificationClick}
              className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#d1e9fe] relative"
              aria-label="Notifications"
            >
              <svg
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {hasNotifications && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </button>

            <button
              onClick={onSettingsClick}
              className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#d1e9fe]"
              aria-label="Settings"
            >
              <svg
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
