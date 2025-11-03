'use client';


import { withAdminAuth } from '@/hoc/withAuth';
export default withAdminAuth(function TransactionsReports() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Transactions & Reports</h2>
        <p className="text-gray-600">
          View transaction history, generate reports, and analyze financial
          data.
        </p>
      </div>
    </div>
  );
});
