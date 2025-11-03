'use client';


import { withCustomerAuth } from '@/hoc/withAuth';
import React from "react";

const BillingPlanPage = () => {
  return (
    <div className="p-6">
      {/* Nội dung trang Billing Plan sẽ được thêm sau */}
    </div>
  );
};

export default withCustomerAuth(BillingPlanPage);
