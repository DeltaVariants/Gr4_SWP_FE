'use client';


import { withCustomerAuth } from '@/hoc/withAuth';
import React from "react";

const BookingPage = () => {
  return (
    <div className="p-6">{/* Nội dung trang Booking sẽ được thêm sau */}</div>
  );
};

export default withCustomerAuth(BookingPage);
