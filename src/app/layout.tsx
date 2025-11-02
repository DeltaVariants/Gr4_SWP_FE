import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "../application/providers/ReduxProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from '@/presentation/components/ui/Notification';
import Providers from "./provider";

export const metadata: Metadata = {
  title: "eSwap - Driver Portal",
  description: "Electric vehicle battery swapping platform for drivers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Leaflet Routing Machine CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Leaflet JS */}
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          strategy="lazyOnload"
        />
        {/* Leaflet Routing Machine JS */}
        <Script
          src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"
          strategy="lazyOnload"
        />
        <AuthProvider>
          <ToastProvider>
            <ReduxProvider>{children}</ReduxProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}