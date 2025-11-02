'use client';

import { useEffect, useState } from 'react';

const STATIONS = [
  { id: 'st-001', name: 'District 1' },
  { id: 'st-003', name: 'District 3' },
  { id: 'st-td', name: 'Thu Duc' },
];

export function StationSwitcher() {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('activeStation') : null;
    setValue(saved || STATIONS[0].id);
  }, []);

  useEffect(() => {
    if (!value) return;
    localStorage.setItem('activeStation', value);
    // Dispatch a lightweight event other components can listen to if needed
    window.dispatchEvent(new CustomEvent('station:change', { detail: { stationId: value } }));
  }, [value]);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="hidden md:inline text-gray-500">Station</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 rounded-md border-gray-300 bg-white px-2 text-gray-900 focus:border-[#0062FF] focus:ring-[#0062FF]"
      >
        {STATIONS.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </label>
  );
}
