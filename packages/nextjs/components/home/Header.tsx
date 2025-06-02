import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocsDropdown } from "./DocsDropdown";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Close menu when navigating
  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10 shadow">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 relative">
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

        {/* DocsDropdown and Hamburger */}
        <div className="flex items-center gap-2">
          <DocsDropdown />
          <button
            className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        <nav
          className={`fixed top-0 right-0 w-64 bg-white dark:bg-gray-900 shadow-2xl h-full z-50 transform transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
          style={{ minHeight: "100vh" }}
        >
          <button
            className="flex self-end m-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-7 h-7" />
          </button>
          <div className="flex flex-col gap-2 mt-10 px-6">
            <button
              className="w-full text-left py-3 px-4 rounded-lg font-semibold text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition"
              onClick={() => handleNav("/trophy-app")}
            >
              Explore Challenges
            </button>
            <button
              className="w-full text-left py-3 px-4 rounded-lg font-semibold text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition"
              onClick={() => handleNav("/backoffice")}
            >
              Organization Portal
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
