'use client';


import { withAdminAuth } from '@/hoc/withAuth';
export default withAdminAuth(function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
        <p className="text-gray-600">
          Welcome to the admin dashboard. System metrics and analytics will be
          displayed here.
        </p>
      </div>
    </div>
  );
});
