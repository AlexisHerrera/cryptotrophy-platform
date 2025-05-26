"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Modal from "~~/components/Modal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface MintTokenModalProps {
  organizationId: bigint;
  currentTokenSymbol: string;
  onClose: () => void;
  onMintSuccess?: () => void;
}

const MintTokenModal: React.FC<MintTokenModalProps> = ({
  organizationId,
  currentTokenSymbol,
  onClose,
  onMintSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync: mintOrganizationToken } = useScaffoldWriteContract("OrganizationManager");

  const handleMint = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      notification.error("Please enter a valid token amount to mint.");
      return;
    }
    setIsLoading(true);
    try {
      const mintInWei = ethers.parseUnits(amount, 18);
      await mintOrganizationToken({
        functionName: "mintOrganizationToken",
        args: [organizationId, mintInWei],
      });
      notification.success(`Minted ${amount} ${currentTokenSymbol} successfully.`);
      setAmount("");
      onMintSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      notification.error(error.message || "Failed to mint tokens.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6 bg-base-100 rounded-lg shadow-xl max-w-md mx-auto">
        <h3 className="text-2xl font-semibold mb-4 text-center text-primary">Mint {currentTokenSymbol}</h3>
        <label className="label">
          <span className="label-text">Amount to Mint</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full mb-4"
          placeholder={`e.g. 100.0`}
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <div className="modal-action flex justify-center">
          <button className="btn btn-secondary btn-wide" onClick={handleMint} disabled={isLoading}>
            {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />}
            {isLoading ? "Minting..." : "Mint Tokens"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MintTokenModal;
