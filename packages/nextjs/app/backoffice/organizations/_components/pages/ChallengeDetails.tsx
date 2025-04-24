import React, { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface ChallengeDetailsFormProps {
  formData: ChallengeData;
  handleInputChange: (field: keyof ChallengeData, value: string | Record<string, any> | bigint) => void;
}

const ChallengeDetailsForm: React.FC<ChallengeDetailsFormProps> = ({ formData, handleInputChange }) => {
  const [maxPrizeAmount, setMaxPrizeAmount] = useState<bigint | null>(null);

  const organizationId = formData.organizationId;

  // Hook to get available tokens
  const { data: availableTokens } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "tokensAvailable",
    args: [organizationId],
  });
  console.log(
    "Organization Id:",
    organizationId,
    "token decimals:",
    DECIMALS_TOKEN,
    "available tokens:",
    availableTokens,
  );
  useEffect(() => {
    if (availableTokens !== undefined) {
      setMaxPrizeAmount(availableTokens as bigint);
      handleInputChange("maxPrizeAmount", availableTokens);
    }
  }, [availableTokens]);

  const formattedMaxPrizeAmount = maxPrizeAmount !== null ? formatUnits(maxPrizeAmount, DECIMALS_TOKEN) : "Loading...";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Create Challenge</h2>
      <div className="flex flex-col gap-4">
        <textarea
          name="description"
          placeholder="Describe your challenge here (e.g., Complete the task in 7 days)"
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
          className="textarea textarea-bordered w-full"
        />
        <div className="relative">
          <input
            type="text"
            name="prizeAmount"
            placeholder={`Prize Amount (Max: ${formattedMaxPrizeAmount} tokens)`}
            value={formData.prizeAmount}
            onChange={e => handleInputChange("prizeAmount", e.target.value)}
            className="input input-bordered w-full"
          />
          <span className="absolute right-2 top-2 text-gray-500 text-sm">Max: {formattedMaxPrizeAmount}</span>
        </div>
        <input
          type="datetime-local"
          name="startTime"
          placeholder="Start Time"
          value={formData.startTime}
          onChange={e => handleInputChange("startTime", e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="datetime-local"
          name="endTime"
          placeholder="End Time"
          value={formData.endTime}
          onChange={e => handleInputChange("endTime", e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          name="maxWinners"
          placeholder="Max Winners (default: 1)"
          value={formData.maxWinners}
          onChange={e => handleInputChange("maxWinners", e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
};

export default ChallengeDetailsForm;
