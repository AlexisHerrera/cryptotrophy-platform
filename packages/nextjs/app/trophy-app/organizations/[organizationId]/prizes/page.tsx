"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { BackButton } from "~~/components/common/BackButton";
import PrizeTable, { ClaimAmounts } from "~~/components/common/PrizeTable";
import { useEthersSigner } from "~~/hooks/ethers/useEthersSigner";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { checkAndApproveErc20 } from "~~/utils/orgTokens/approve";
import { notification } from "~~/utils/scaffold-eth";

const PrizeCenter: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  const { address } = useAccount();
  const signer = useEthersSigner();
  const [claimAmounts, setClaimAmounts] = useState<ClaimAmounts>({});

  const {
    data: prizesData,
    isLoading: isPrizesLoading,
    refetch: refetchPrizes,
  } = useScaffoldReadContract({
    contractName: "Prizes",
    functionName: "listPrizes",
    args: [BigInt(organizationId)],
  });

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getBalanceOfUser",
    args: [BigInt(organizationId), address || ethers.ZeroAddress],
  });

  const { data: orgTokenAddressData } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getTokenOfOrg",
    args: [BigInt(organizationId)],
  });

  const { data: prizesDeployed } = useDeployedContractInfo("Prizes");
  const prizesContractAddress = prizesDeployed?.address ?? ethers.ZeroAddress;

  const { writeContractAsync: claimPrize } = useScaffoldWriteContract("Prizes");

  const handleClaimAmountChange = (prizeId: bigint, value: string) => {
    setClaimAmounts(prev => ({
      ...prev,
      [prizeId.toString()]: value,
    }));
  };

  const handleClaim = async (prizeId: bigint) => {
    try {
      if (
        address === undefined ||
        prizesData === undefined ||
        balanceData === undefined ||
        orgTokenAddressData === undefined
      ) {
        notification.error("Error fetching data.");
        return;
      }
      const amountStr = claimAmounts[prizeId.toString()] || "0";
      const amountBN = BigInt(amountStr);
      if (amountBN <= 0n) {
        notification.error("Invalid amount.");
        return;
      }

      const idx = prizesData[0].indexOf(prizeId);
      if (idx < 0) {
        notification.error("Prize not found.");
        return;
      }
      const unitPriceBN = prizesData[3][idx];
      const totalCostBN = amountBN * unitPriceBN;

      if (totalCostBN > balanceData[0]) {
        notification.error("Insufficient token balance.");
        return;
      }

      console.log("Claiming prize:", prizeId.toString(), amountBN, totalCostBN.toString());

      const tokenAddress = orgTokenAddressData as string;
      const ok = await checkAndApproveErc20(tokenAddress, prizesContractAddress, totalCostBN, address, signer);

      if (!ok) {
        notification.error("User canceled or allowance is still insufficient");
        return;
      }

      await claimPrize({
        functionName: "claimPrize",
        args: [BigInt(organizationId), prizeId, amountBN],
      });

      notification.success(`Prize #${prizeId.toString()} claimed successfully!`);
      await refetchPrizes();
      await refetchBalance();
    } catch (error) {
      console.error("Error claiming prize:", error);
    }
  };

  if (isPrizesLoading || isBalanceLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  // Access the data directly without destructuring to handle readonly arrays
  const ids = prizesData?.[0] || [];
  const names = prizesData?.[1] || [];
  const descriptions = prizesData?.[2] || [];
  const prices = prizesData?.[3] || [];
  const stocks = prizesData?.[4] || [];
  const nftContracts = prizesData?.[5] || [];
  const imageCIDs = prizesData?.[6] || [];

  const prizes = ids.map((id: bigint, index: number) => ({
    id,
    name: names[index],
    description: descriptions[index],
    price: prices[index],
    stock: stocks[index],
    imageCID: imageCIDs[index] || undefined,
  }));

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

        <PrizeTable
          prizes={prizes}
          claimAmounts={claimAmounts}
          onClaimAmountChange={handleClaimAmountChange}
          onClaim={handleClaim}
          isLoading={isPrizesLoading}
          mode="user"
        />
      </div>
    </div>
  );
};

export default PrizeCenter;
