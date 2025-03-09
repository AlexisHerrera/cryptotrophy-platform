"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button className="text-gray-700" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <nav className="absolute right-0 mt-2 w-full bg-white border-t shadow-md">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link
              href="/competitions"
              className="py-2 hover:text-indigo-600 transition"
              onClick={() => setIsOpen(false)}
            >
              My Competitions
            </Link>
            <Link href="/prizes" className="py-2 hover:text-indigo-600 transition" onClick={() => setIsOpen(false)}>
              Prizes
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
