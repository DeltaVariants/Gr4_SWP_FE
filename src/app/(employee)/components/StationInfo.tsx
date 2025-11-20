import { useAuth } from '@/contexts/AuthContext';
import { MapPin, AlertCircle } from 'lucide-react';
import { getStationDisplay } from '@/lib/stationUtils';

export function StationInfo() {
  const { user } = useAuth();

  if (!user) return null;

  const station = getStationDisplay(user);
  
  if (station.name === 'No station assigned') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <div className="flex flex-col">
          <span className="text-xs text-amber-600 font-medium">Warning</span>
          <span className="text-sm text-amber-900 font-semibold">No station assigned</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <MapPin className="w-4 h-4 text-blue-600" />
      <div className="flex flex-col">
        <span className="text-xs text-blue-600 font-medium">Working Station</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-900 font-semibold">{station.name}</span>
          {!station.hasValidId && (
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded" title="Invalid Station ID">
              ⚠️ No ID
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
