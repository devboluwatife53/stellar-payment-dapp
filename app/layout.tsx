import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Payroll — Batch payments on Stellar",
  description:
    "Batch XLM payments on Stellar Testnet — connect Freighter, add recipients, and settle payroll in one atomic transaction, with on-chain record-keeping via Soroban.",
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
  themeColor: "#0b0c0e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void font-inter text-snow antialiased">
        {children}
      </body>
    </html>
  );
}
