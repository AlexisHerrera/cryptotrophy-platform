"use client";

import React, { useState } from "react";
import { parseEther } from "ethers";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Modal from "~~/components/Modal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface FundTokenModalProps {
  organizationId: bigint;
  organizationName: string;
  currentTokenSymbol: string;
  onClose: () => void;
  onFundSuccess?: () => void;
}

const FundTokenModal: React.FC<FundTokenModalProps> = ({
  organizationId,
  organizationName,
  currentTokenSymbol,
  onClose,
  onFundSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync: fundOrganization } = useScaffoldWriteContract("OrganizationManager");

  const handleFund = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      notification.error("Please enter a valid amount to fund.");
      return;
    }

    setIsLoading(true);
    try {
      await fundOrganization({
        functionName: "fundOrganization",
        args: [organizationId],
        value: parseEther(amount),
      });
      notification.success(`Successfully funded ${organizationName} with ${amount} ETH.`);
      setAmount("");
      if (onFundSuccess) {
        onFundSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error("Error funding organization:", error);
      notification.error(error.message || "Failed to fund organization.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6 bg-base-100 rounded-lg shadow-xl max-w-md mx-auto">
        <h3 className="text-2xl font-semibold mb-4 text-center text-primary">Fund {organizationName}</h3>
        <p className="mb-2 text-center text-sm">
          You are sending ETH to be converted into {currentTokenSymbol} tokens for this organization.
        </p>
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Amount in ETH</span>
          </label>
          <input
            type="number"
            placeholder="e.g., 0.1"
            className="input input-bordered w-full"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="modal-action flex justify-center mt-6">
          <button className="btn btn-ghost mr-2" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleFund} disabled={isLoading || !amount}>
            {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />}
            {isLoading ? "Processing..." : "Fund Now"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FundTokenModal;
