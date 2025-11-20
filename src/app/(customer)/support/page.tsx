'use client';


import { withCustomerAuth } from '@/hoc/withAuth';
import React from "react";

const SupportPage = () => {
  return (
    <div className="p-6">{/* Nội dung trang Support sẽ được thêm sau */}</div>
  );
};

export default withCustomerAuth(SupportPage);
