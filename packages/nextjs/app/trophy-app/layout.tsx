"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "~~/app/trophy-app/_components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <Link
              href="/"
              passHref
              className="flex items-center gap-2 px-3 py-2 font-semibold font-sans text-gray-800 dark:text-gray-100 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition text-base tracking-tight ml-4 mr-6 shrink-0"
            >
              <div className="flex relative w-8 h-8">
                <Image
                  alt="CryptoTrophy logo"
                  className="cursor-pointer rounded-lg aspect-square object-cover"
                  fill
                  src="/logo.ico"
                />
              </div>
              {/* Show only on large screens */}
              <div className="hidden lg:flex flex-col">
                <span className="font-semibold leading-tight">CryptoTrophy</span>
              </div>
            </Link>

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
