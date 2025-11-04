"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // DEV MODE: Nếu có NEXT_PUBLIC_API_TOKEN, bypass tất cả checks
    const devToken = process.env.NEXT_PUBLIC_API_TOKEN;
    if (devToken) {
      console.log(
        "🔓 [DEV MODE] Bypassing AdminAuthGuard - using NEXT_PUBLIC_API_TOKEN"
      );
      setIsChecking(false);
      return;
    }

    // Đợi auth context load xong
    if (loading) return;

    // Kiểm tra xem có token trong localStorage không (fallback)
    const hasToken =
      typeof window !== "undefined" && localStorage.getItem("accessToken");

    // Nếu không có auth và không có token -> redirect về login
    if (!isAuthenticated && !hasToken) {
      router.replace("/login");
      return;
    }

    // Nếu có auth nhưng không phải admin -> redirect về home
    if (isAuthenticated && user && user.role?.toUpperCase() !== "ADMIN") {
      router.replace("/home");
      return;
    }

    // Tất cả checks đã pass
    setIsChecking(false);
  }, [isAuthenticated, user, loading, router]);

  // Hiển thị loading trong khi check auth
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Render children nếu đã pass tất cả checks
  return <>{children}</>;
}
