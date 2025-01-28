import React, { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "ethers";
import Modal from "~~/components/Modal";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CreateChallengeModalProps {
  organizationId: bigint;
  onClose: () => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ organizationId, onClose }) => {
  const [formData, setFormData] = useState({
    description: "",
    prizeAmount: "",
    startTime: "",
    endTime: "",
    maxWinners: "1",
  });

  const [maxPrizeAmount, setMaxPrizeAmount] = useState<bigint | null>(null);

  const { writeContractAsync: organizationManager } = useScaffoldWriteContract("OrganizationManager");
  const challengeManagerAddress = useDeployedContractInfo("ChallengeManager").data?.address;
  console.log("Challenge Manager Address:", challengeManagerAddress);
  // Hook to get available tokens
  const { data: availableTokens } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "tokensAvailable",
    args: [organizationId],
  });

  // Hook to get decimals from the main contract
  const { data: decimals } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getTokenDecimals",
    args: [organizationId],
  });

  const decimalsNumber = decimals ? Number(decimals) : null;
  console.log(
    "Organization Id:",
    organizationId,
    "token decimals:",
    decimalsNumber,
    "available tokens:",
    availableTokens,
  );
  useEffect(() => {
    if (availableTokens) {
      setMaxPrizeAmount(availableTokens as bigint);
    }
  }, [availableTokens]);

  const formattedMaxPrizeAmount =
    maxPrizeAmount && decimalsNumber !== null ? formatUnits(maxPrizeAmount, decimalsNumber) : "Loading...";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateChallenge = async () => {
    const { description, prizeAmount, startTime, endTime, maxWinners } = formData;
    try {
      if (decimalsNumber === null) {
        alert("Decimals not loaded yet.");
        return;
      }

      const prizeAmountInBaseUnits = parseUnits(prizeAmount, decimalsNumber);

      await organizationManager({
        functionName: "createChallengeAndTransfer",
        args: [
          challengeManagerAddress,
          organizationId,
          description,
          prizeAmountInBaseUnits,
          BigInt(new Date(startTime).getTime() / 1000),
          BigInt(new Date(endTime).getTime() / 1000),
          BigInt(maxWinners),
        ],
      });
      alert("Challenge created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  // Set default dates
  useEffect(() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setFormData(prev => ({
      ...prev,
      startTime: now.toISOString().slice(0, 16),
      endTime: oneWeekLater.toISOString().slice(0, 16),
    }));
  }, []);

  const isCreateButtonDisabled =
    !maxPrizeAmount ||
    !decimalsNumber ||
    !formData.prizeAmount ||
    parseUnits(formData.prizeAmount, decimalsNumber) > maxPrizeAmount;

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center">Create Challenge</h2>
      <div className="flex flex-col gap-4">
        <textarea
          name="description"
          placeholder="Describe your challenge here (e.g., Complete the task in 7 days)"
          value={formData.description}
          onChange={handleInputChange}
          className="textarea textarea-bordered w-full"
        />
        <div className="relative">
          <input
            type="text"
            name="prizeAmount"
            placeholder={`Prize Amount (Max: ${formattedMaxPrizeAmount} tokens)`}
            value={formData.prizeAmount}
            onChange={handleInputChange}
            className="input input-bordered w-full"
          />
          <span className="absolute right-2 top-2 text-gray-500 text-sm">Max: {formattedMaxPrizeAmount}</span>
        </div>
        <input
          type="datetime-local"
          name="startTime"
          placeholder="Start Time"
          value={formData.startTime}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <input
          type="datetime-local"
          name="endTime"
          placeholder="End Time"
          value={formData.endTime}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          name="maxWinners"
          placeholder="Max Winners (default: 1)"
          value={formData.maxWinners}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <button className="btn btn-primary" onClick={handleCreateChallenge} disabled={isCreateButtonDisabled}>
          Create
        </button>
      </div>
    </Modal>
  );
};

export default CreateChallengeModal;
