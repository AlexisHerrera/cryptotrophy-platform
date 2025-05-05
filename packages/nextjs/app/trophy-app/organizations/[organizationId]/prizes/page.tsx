"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PrizesGrid } from "../../_components/PrizesGrid";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { BackButton } from "~~/components/common/BackButton";
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
    <div className="flex justify-between">
      <BackButton />
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-4xl text-gray-700 font-mono grayscale mb-4 dark:text-gray-300 text-center">Prize Center</h1>

        <div className="mb-4 text-center">
          <span className="font-bold">Your Balance:</span>{" "}
          {ethers.formatUnits(balanceData ? balanceData[0] : 0n, DECIMALS_TOKEN)}{" "}
          {balanceData ? balanceData[1] : "Tokens"}
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Link href={`/trophy-app/organizations/${organizationId}/my-prizes`} className="btn btn-secondary">
            View My NFTs
          </Link>
        </div>

        <PrizesGrid orgId={organizationId} />
      </div>
    </div>
  );
};

export default PrizeCenter;
