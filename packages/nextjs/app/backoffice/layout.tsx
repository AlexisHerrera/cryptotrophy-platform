import React from "react";
import Image from "next/image";
import Link from "next/link";
import BackofficeNavbar from "~~/app/backoffice/_components/Navbar";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
          <div className="flex items-center space-x-4">
            <RainbowKitCustomConnectButton showBalanceAndChainName={false} />
            <BackofficeNavbar />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
