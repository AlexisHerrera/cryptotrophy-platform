"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/backoffice/create-organization", label: "Create Organization" },
  { href: "/backoffice/organizations", label: "Administrated Organizations" },
];

export default function BackofficeNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-200">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="md:hidden relative">
        <button
          className="text-gray-700 dark:text-gray-300"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="backoffice-mobile-menu"
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <nav
            id="backoffice-mobile-menu"
            className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-md md:hidden z-50"
          >
            <div className="flex flex-col px-4 py-2 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
