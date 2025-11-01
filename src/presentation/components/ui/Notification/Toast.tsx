"use client";

import React from 'react';

interface ToastProps {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast = ({ title, message, type, onClose }: ToastProps) => {
  let theme = 'bg-green-50 border-green-200 text-green-800';
  if (type === 'error') theme = 'bg-red-50 border-red-200 text-red-800';
  if (type === 'info') theme = 'bg-blue-50 border-blue-200 text-blue-800';

  return (
    <div
      role="status"
      className={`w-80 max-w-xs border rounded-md p-3 shadow-sm ${theme}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {title && <div className="font-semibold text-sm">{title}</div>}
          <div className="text-sm mt-1">{message}</div>
        </div>
        <button
          aria-label="Close notification"
          onClick={onClose}
          className="text-sm font-medium ml-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
