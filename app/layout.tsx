import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Payroll",
  description:
    "Batch XLM payments on Stellar Testnet — connect Freighter, add recipients, and send payroll in one go.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stellar Payroll",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
