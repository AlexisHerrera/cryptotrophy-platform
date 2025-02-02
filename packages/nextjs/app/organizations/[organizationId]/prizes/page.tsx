"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import CreatePrizeModal from "./_components/CreatePrizeModal";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { checkAndApproveErc20 } from "~~/utils/orgTokens/approve";
import { notification } from "~~/utils/scaffold-eth";

const PrizeCenter: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  const { address } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [claimAmounts, setClaimAmounts] = useState<{ [prizeId: string]: string }>({});

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
      const ok = await checkAndApproveErc20(tokenAddress, prizesContractAddress, totalCostBN, address);

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

  const [ids = [], names = [], descriptions = [], prices = [], stocks = []] = prizesData || [];

  const prizes = ids.map((id: bigint, index: number) => ({
    id,
    name: names[index],
    description: descriptions[index],
    price: prices[index],
    stock: stocks[index],
  }));

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl text-gray-700 font-mono grayscale mb-4 dark:text-gray-300 text-center">Prize Center</h1>

      <div className="mb-4 text-center">
        <span className="font-bold">Your Balance:</span>{" "}
        {ethers.formatUnits(balanceData ? balanceData[0] : 0n, DECIMALS_TOKEN)}{" "}
        {balanceData ? balanceData[1] : "Tokens"}
      </div>

      <div className="flex justify-center mb-6">
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          Create Prize
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full border border-gray-300">
          <thead>
            <tr>
              <th>Prize ID</th>
              <th>Name</th>
              <th>Price (tokens)</th>
              <th>Stock</th>
              <th>Claim</th>
            </tr>
          </thead>
          <tbody>
            {prizes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No prizes found.
                </td>
              </tr>
            ) : (
              prizes.map(prize => (
                <tr key={prize.id.toString()}>
                  <td>{prize.id.toString()}</td>
                  <td>{prize.name}</td>
                  <td>{ethers.formatUnits(prize.price, 18)}</td>
                  <td>{prize.stock.toString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        className="input input-bordered w-20"
                        value={claimAmounts[prize.id.toString()] || ""}
                        onChange={e =>
                          setClaimAmounts(prev => ({
                            ...prev,
                            [prize.id.toString()]: e.target.value,
                          }))
                        }
                      />
                      <button className="btn btn-secondary" onClick={() => handleClaim(prize.id)}>
                        Claim
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreatePrizeModal
        orgId={organizationId}
        isOpen={isCreateModalOpen}
        onClose={async () => {
          setIsCreateModalOpen(false);
          await refetchPrizes();
        }}
      />
    </div>
  );
};

export default PrizeCenter;
