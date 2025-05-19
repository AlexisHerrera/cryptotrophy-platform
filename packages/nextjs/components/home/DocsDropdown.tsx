import React, { useEffect, useRef, useState } from "react";

export function DocsDropdown() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: any) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = [
    { label: "For Participants", href: "/docs/users" },
    { label: "For Organizations", href: "/docs/organizations" },
    { label: "Architecture", href: "/docs/technical" },
  ];

  return (
    <nav className="flex items-center gap-4">
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center gap-2 px-3 py-2 font-semibold font-sans text-gray-800 dark:text-gray-100 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition text-base tracking-tight"
          onClick={() => setOpen(v => !v)}
          aria-haspopup="true"
          aria-expanded={open}
          style={{ minHeight: "40px" }}
        >
          <span>Documentation</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-indigo-100 dark:ring-gray-800 z-30 animate-fade-in font-sans">
            <ul className="py-2">
              {items.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-5 py-2.5 text-gray-800 dark:text-gray-100 rounded-lg transition 
                      hover:bg-indigo-50 dark:hover:bg-indigo-900 
                      hover:font-semibold text-base tracking-tight"
                    style={{ fontFamily: "Inter, Space Grotesk, sans-serif" }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease;
        }
      `}</style>
    </nav>
  );
}
