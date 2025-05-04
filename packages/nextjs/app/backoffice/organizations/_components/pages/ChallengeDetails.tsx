import React, { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface ChallengeDetailsFormProps {
  formData: ChallengeData;
  handleInputChange: (field: keyof ChallengeData, value: string | Record<string, any> | number | bigint) => void;
}

const ChallengeDetailsForm: React.FC<ChallengeDetailsFormProps> = ({ formData, handleInputChange }) => {
  const [maxPrizeAmount, setMaxPrizeAmount] = useState<bigint | null>(null);

  const organizationId = formData.organizationId;

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
  }, [availableTokens, handleInputChange]);

  const formattedMaxPrizeAmount = maxPrizeAmount !== null ? formatUnits(maxPrizeAmount, DECIMALS_TOKEN) : "Loading...";
  const handleNumericInputChange = (field: keyof ChallengeData, value: string) => {
    if (value === "") {
      handleInputChange(field, "");
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        handleInputChange(field, numValue);
      }
    }
  };
  return (
    <div>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-base-content mb-1">
            Challenge Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your challenge here (e.g., Complete the task in 7 days)"
            value={formData.description}
            onChange={e => handleInputChange("description", e.target.value)}
            className="textarea textarea-bordered w-full text-base-content rounded-md"
            rows={3}
          />
        </div>

        {/* Prize Amount and Max Winners in same row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="prizeAmount" className="block text-sm font-medium text-base-content mb-1">
              Prize Amount per Winner
            </label>
            <div className="relative">
              <input
                id="prizeAmount"
                type="number"
                name="prizeAmount"
                min="0"
                step="any"
                placeholder={`Amount`}
                value={formData.prizeAmount === 0 ? "" : formData.prizeAmount}
                onChange={e => handleNumericInputChange("prizeAmount", e.target.value)}
                className="input input-bordered w-full text-base-content pr-24"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-base-content/70">
                Max: {formattedMaxPrizeAmount}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="maxWinners" className="block text-sm font-medium text-base-content mb-1">
              Maximum Number of Winners
            </label>
            <input
              id="maxWinners"
              type="number"
              name="maxWinners"
              min="1"
              step="1"
              placeholder="Max Winners (e.g., 1)"
              value={formData.maxWinners === 0 ? "1" : formData.maxWinners}
              onChange={e => handleNumericInputChange("maxWinners", e.target.value)}
              className="input input-bordered w-full text-base-content"
            />
          </div>
        </div>

        {/* Start Time and End Time in same row */}
        <div className="flex gap-4 max-w-full">
          <div className="w-1/2">
            <label htmlFor="startTime" className="block text-sm font-medium text-base-content mb-1">
              Start Time
            </label>
            <input
              id="startTime"
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={e => handleInputChange("startTime", e.target.value)}
              className="input input-bordered w-full text-base-content"
            />
          </div>

          <div className="w-1/2">
            <label htmlFor="endTime" className="block text-sm font-medium text-base-content mb-1">
              End Time
            </label>
            <input
              id="endTime"
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={e => handleInputChange("endTime", e.target.value)}
              className="input input-bordered w-full text-base-content"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailsForm;
