import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Golf Score Tracker",
  description: "Track rounds, layouts, and player stats for your golf game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
