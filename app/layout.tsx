import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Modern task management app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}