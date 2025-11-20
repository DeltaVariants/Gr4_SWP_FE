'use client';


import { withCustomerAuth } from '@/hoc/withAuth';
import React from "react";

const HistoryPage = () => {
  return (
    <div className="p-6">{/* Nội dung trang History sẽ được thêm sau */}</div>
  );
};

export default withCustomerAuth(HistoryPage);
