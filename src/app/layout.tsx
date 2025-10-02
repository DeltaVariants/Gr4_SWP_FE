import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
