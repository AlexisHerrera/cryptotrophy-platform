import React, { useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEthersSigner } from "~~/hooks/ethers/useEthersSigner";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Prize } from "~~/utils/cryptotrophyIndex/types";
import { checkAndApproveErc20 } from "~~/utils/orgTokens/approve";
import { notification } from "~~/utils/scaffold-eth";

export const ClaimPrizePanel: React.FC<{
  prize: Prize;
  onClose: () => void;
}> = ({ prize, onClose }) => {
  const [amount, setAmount] = useState(1);
  const { address } = useAccount();
  const signer = useEthersSigner();
  const organizationId = BigInt(prize.orgId);
  const prizeId = BigInt(prize.id);

  const { data: balanceData, isLoading: isBalanceLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getBalanceOfUser",
    args: [organizationId, address || ethers.ZeroAddress],
  });

  const { data: orgTokenAddressData, isLoading: isOrgTokenAddressData } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getTokenOfOrg",
    args: [organizationId],
  });

  const { data: prizesDeployed } = useDeployedContractInfo("Prizes");
  const prizesContractAddress = prizesDeployed?.address ?? ethers.ZeroAddress;

  const { writeContractAsync: claimPrize } = useScaffoldWriteContract("Prizes");

  const handleClaim = async () => {
    try {
      if (
        address === undefined ||
        prize === undefined ||
        balanceData === undefined ||
        orgTokenAddressData === undefined
      ) {
        notification.error("Error fetching data.");
        return;
      }
      const amountBN = BigInt(amount);
      if (amountBN <= 0n) {
        notification.error("Invalid amount.");
        return;
      }
      const unitPriceBN = BigInt(prize.price);
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
      onClose();
    } catch (error) {
      console.error("Error claiming prize:", error);
    }
  };

  if (isOrgTokenAddressData || isBalanceLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{prize.name}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">Stock: {prize.stock}</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Price: {ethers.formatEther(prize.price)} TOKEN</p>
        <input
          type="number"
          min={1}
          max={Number(prize.stock)}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-md mb-4 dark:bg-gray-700 dark:text-white"
        />
        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={() => handleClaim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Confirm Claim
          </button>
        </div>
      </div>
    </div>
  );
};
