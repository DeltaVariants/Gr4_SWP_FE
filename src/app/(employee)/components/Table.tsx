'use client';

import { ReactNode } from 'react';

export function Table({
  columns,
  data,
  empty,
}: {
  columns: { key: string; header: string; render?: (row: Record<string, unknown>) => ReactNode }[];
  data: Record<string, unknown>[];
  empty?: ReactNode;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-5 py-3 border-b border-gray-200 sticky top-0 z-10 bg-white/95 backdrop-blur text-xs font-medium uppercase tracking-wide"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-gray-500" colSpan={columns.length}>
                  {empty || (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">📄</div>
                      <div className="text-sm">No data to display</div>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="even:bg-gray-50/60 hover:bg-blue-50/60 transition-colors"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-3 border-b border-gray-100 text-gray-900">
                      {c.render ? c.render(row) : String(row[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
