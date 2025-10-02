import React from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  weather?: {
    temperature: string;
    condition: string;
  };
  hasNotifications?: boolean;
}

export default function Header({
  title = "Home",
  subtitle = "Welcome back! Monitor your EV battery status and find nearby swap stations.",
  weather = { temperature: "24°C", condition: "Sunny" },
  hasNotifications = true,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1E1E]">{title}</h1>
          <p className="text-sm text-[#B3B3B3] mt-1">{subtitle}</p>
        </div>

        {/* Weather and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Weather Widget */}
          <div className="bg-[#E6F4FE] rounded-lg px-3 py-2 flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-[#1E5A8C]">
              {weather.temperature}
            </span>
            <span className="text-sm text-[#B3B3B3]">{weather.condition}</span>
          </div>

          {/* Notification Icons */}
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-[#E6F4FE] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#d1e9fe]">
              <svg
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>

            {hasNotifications && (
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            )}

            <div className="w-9 h-9 bg-[#E6F4FE] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#d1e9fe]">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
