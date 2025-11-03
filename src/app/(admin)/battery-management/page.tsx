'use client';


import { withAdminAuth } from '@/hoc/withAuth';
export default withAdminAuth(function BatteryManagement() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Battery Management</h2>
        <p className="text-gray-600">
          Manage battery inventory, monitor battery health, and track battery
          lifecycle.
        </p>
      </div>
    </div>
  );
});
