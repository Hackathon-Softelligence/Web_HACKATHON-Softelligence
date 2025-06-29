import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Exam Proctoring",
  description: "Smart Exam Proctoring",
  generator: "Softelligence",
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
