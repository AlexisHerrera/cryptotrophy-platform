"use client";

import React, { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { BackButton } from "~~/components/common/BackButton";
import PrizeTable from "~~/components/common/PrizeTable";
import CreatePrizeModal from "~~/components/common/_components/CreatePrizeModal";
import { useEthersSigner } from "~~/hooks/ethers/useEthersSigner";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { checkAndApproveErc20 } from "~~/utils/orgTokens/approve";
import { notification } from "~~/utils/scaffold-eth";

interface PrizePageProps {
  organizationId: string;
  mode: "user" | "admin";
}

const PrizePage: React.FC<PrizePageProps> = ({ organizationId, mode }) => {
  const { address } = useAccount();
  const signer = useEthersSigner();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [claimAmounts, setClaimAmounts] = useState<{ [prizeId: string]: string }>({});

  const handleClaimAmountChange = useCallback((prizeId: bigint, value: string) => {
    setClaimAmounts(prev => ({
      ...prev,
      [prizeId.toString()]: value,
    }));
  }, []);

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

  console.log(prizesData);
  const [ids = [], names = [], descriptions = [], prices = [], stocks = [], _, imageCID = []] = prizesData || [];

  console.log("Raw image cids from contract:", imageCID);

  const prizes = ids.map((id: bigint, index: number) => ({
    id,
    name: names[index],
    description: descriptions[index],
    price: prices[index],
    stock: stocks[index],
    imageCID: imageCID[index] || "",
  }));

  // For debugging
  console.log("Prizes with image cids:", prizes);

  return (
    <div className="flex justify-between">
      <BackButton />
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-4xl text-gray-700 font-mono grayscale mb-4 dark:text-gray-300 text-center">Prize Center</h1>
        {mode === "user" && (
          <div className="mb-4 text-center">
            <span className="font-bold">Your Balance:</span>{" "}
            {ethers.formatUnits(balanceData ? balanceData[0] : 0n, DECIMALS_TOKEN)}{" "}
            {balanceData ? balanceData[1] : "Tokens"}
          </div>
        )}
        {mode === "admin" && (
          <div className="flex justify-center mb-6">
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              Create Prize
            </button>
          </div>
        )}

        <PrizeTable
          prizes={prizes}
          claimAmounts={claimAmounts}
          onClaimAmountChange={handleClaimAmountChange}
          onClaim={handleClaim}
          isLoading={isPrizesLoading || isBalanceLoading}
          mode={mode}
        />
        <CreatePrizeModal
          orgId={organizationId}
          isOpen={isCreateModalOpen}
          onClose={async () => {
            setIsCreateModalOpen(false);
            await refetchPrizes();
          }}
        />
      </div>
    </div>
  );
};

export default PrizePage;
