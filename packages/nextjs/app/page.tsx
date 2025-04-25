"use client";

import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { MotionDiv } from "~~/app/motions/use-motion";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <header className="w-full max-w-5xl mx-auto text-center py-6">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Crypto<span className="text-indigo-500">Trophy</span> Platform
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Revolutionize your organization with blockchain technology.
          </p>
        </header>
        <main className="w-full flex flex-col items-center">
          <h2 className="text-3xl font-semibold mb-6 text-center">Create your organization on the blockchain</h2>
          <div className="flex gap-4">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
              onClick={() => {
                router.push("/backoffice");
              }}
            >
              Backoffice
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
              onClick={() => {
                router.push("/trophy-app");
              }}
            >
              TrophyApp
            </button>
          </div>
        </main>

        <footer className="absolute bottom-4 text-center text-sm text-gray-400">
          {connectedAddress ? <p>Connected Wallet: {connectedAddress}</p> : <p>Connect your wallet to get started.</p>}
        </footer>
      </div>
    </MotionDiv>
  );
};

export default Home;
