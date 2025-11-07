"use client";

import { store } from "@/application/store";
import { Provider as ReduxProvider } from "react-redux";
import { AuthProvider } from "@/presentation/contexts/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </ReduxProvider>
  );
}
