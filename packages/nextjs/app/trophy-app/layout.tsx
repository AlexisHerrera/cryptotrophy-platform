"use client";

import React from "react";
import Link from "next/link";
import Navbar from "~~/app/trophy-app/_components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <Link
                href="/trophy-app"
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition"
              >
                Home
              </Link>
            </div>
            <div className="flex items-center">
              {" "}
              <Navbar />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
