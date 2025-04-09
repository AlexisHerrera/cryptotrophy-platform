// app/layout.tsx
import Link from "next/link";
import Navbar from "~~/app/(cryptotrophy)/_components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/organizations" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Organizations
          </Link>

          <nav className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-200">
            <Link href="/create-organization" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Create Organization
            </Link>
            {/*<Link href="/competitions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">*/}
            {/*  Register Algorithm*/}
            {/*</Link>*/}
          </nav>

          <Navbar />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
