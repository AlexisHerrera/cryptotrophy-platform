import React from "react";
import Link from "next/link";
import BackofficeNavbar from "~~/app/backoffice/_components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/backoffice/organizations" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Organizations
          </Link>
          <BackofficeNavbar />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
