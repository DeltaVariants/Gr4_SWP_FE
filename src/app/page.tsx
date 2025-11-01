import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  // When developing locally, redirect to the login page so `npm run dev` shows login.
  if (process.env.NODE_ENV === "development") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">eS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">eSwap</h1>
          <p className="text-gray-500">
            Electric Vehicle Battery Swapping Platform
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Welcome to eSwap
          </h2>
          <p className="text-gray-600 mb-6">
            Your smart solution for electric vehicle battery management. Monitor
            your battery status, find nearby stations, and manage your swaps
            efficiently.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/home"
            className="w-full bg-sky-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Dashboard
          </Link>

          <div className="text-sm text-gray-500">
            Access your driver portal and manage your EV battery swaps
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-sky-600 font-semibold">Battery Monitor</div>
              <div className="text-gray-500">Real-time status</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">Find Stations</div>
              <div className="text-gray-500">Nearby locations</div>
            </div>
            <div className="text-center">
              <div className="text-purple-600 font-semibold">Swap History</div>
              <div className="text-gray-500">Track usage</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-semibold">24/7 Support</div>
              <div className="text-gray-500">Emergency help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
