"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PrizesGrid } from "../../_components/PrizesGrid";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

const PrizeCenter: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  const { address } = useAccount();

  const { data: balanceData, isLoading: isBalanceLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getBalanceOfUser",
    args: [BigInt(organizationId), address || ethers.ZeroAddress],
  });

  if (isBalanceLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950 py-4">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 mb-2">
              🏆 Prize Center
            </h1>
            <div className="mx-auto w-16 h-1 bg-blue-500 rounded-full mb-4"></div>
          </div>

          <div className="mb-6">
            <div className="flex justify-center items-center gap-2">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Your Balance:</span>
              <span className="text-xl font-mono px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shadow">
                {ethers.formatUnits(balanceData ? balanceData[0] : 0n, DECIMALS_TOKEN)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-semibold">
                {balanceData ? balanceData[1] : "Tokens"}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <Link
              href={`/trophy-app/organizations/${organizationId}`}
              className="inline-block px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              Back to Organization
            </Link>
            <Link
              href={`/trophy-app/organizations/${organizationId}/my-prizes`}
              className="inline-block px-6 py-2 rounded-full bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              View My NFTs
            </Link>
          </div>

          <PrizesGrid orgId={organizationId} />
        </div>
      </div>
    </div>
  );
};

export default PrizeCenter;
