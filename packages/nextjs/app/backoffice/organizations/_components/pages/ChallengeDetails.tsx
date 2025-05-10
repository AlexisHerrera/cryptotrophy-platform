import React, { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface ChallengeDetailsFormProps {
  formData: ChallengeData;
  handleInputChange: (field: keyof ChallengeData, value: string | number | bigint) => void;
}

const ChallengeDetailsForm: React.FC<ChallengeDetailsFormProps> = ({ formData, handleInputChange }) => {
  const [maxPrizeAmount, setMaxPrizeAmount] = useState<bigint | null>(null);
  const organizationId = formData.organizationId;

  const { data: availableTokens } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "tokensAvailable",
    args: [organizationId],
  });

  useEffect(() => {
    if (availableTokens !== undefined) {
      setMaxPrizeAmount(availableTokens as bigint);
      handleInputChange("maxPrizeAmount", availableTokens);
    }
  }, [availableTokens, handleInputChange]);

  const formattedMax = maxPrizeAmount ? formatUnits(maxPrizeAmount, DECIMALS_TOKEN) : "…";

  const handleNumber = (field: keyof ChallengeData, v: string) => handleInputChange(field, v === "" ? "" : Number(v));

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Challenge Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Describe your challenge (e.g., complete the task in 7 days)"
          className="textarea textarea-bordered w-full rounded-lg"
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
        />
      </div>

      {/* Prize + Winners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {/* Prize */}
        <div className="space-y-1">
          <label htmlFor="prizeAmount" className="text-sm font-medium">
            Prize Amount per Winner
          </label>
          <div className="input-group">
            <input
              id="prizeAmount"
              type="number"
              min="0"
              step="any"
              placeholder="Amount"
              className="input input-bordered w-full placeholder:text-base-content/60"
              value={formData.prizeAmount || ""}
              onChange={e => handleNumber("prizeAmount", e.target.value)}
            />
            <span className="px-2 text-xs whitespace-nowrap">Max {formattedMax}</span>
          </div>
        </div>

        {/* Max winners */}
        <div className="space-y-1">
          <label htmlFor="maxWinners" className="text-sm font-medium">
            Maximum Number of Winners
          </label>
          <input
            id="maxWinners"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 1"
            className="input input-bordered w-full placeholder:text-base-content/60"
            value={formData.maxWinners || ""}
            onChange={e => handleNumber("maxWinners", e.target.value)}
          />
        </div>
      </div>

      {/* Start + End */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {/* Start */}
        <div className="space-y-1">
          <label htmlFor="startTime" className="text-sm font-medium">
            Start Time
          </label>
          <input
            id="startTime"
            type="datetime-local"
            className="input input-bordered w-full"
            value={formData.startTime}
            onChange={e => handleInputChange("startTime", e.target.value)}
          />
        </div>

        {/* End */}
        <div className="space-y-1">
          <label htmlFor="endTime" className="text-sm font-medium">
            End Time
          </label>
          <input
            id="endTime"
            type="datetime-local"
            className="input input-bordered w-full"
            value={formData.endTime}
            onChange={e => handleInputChange("endTime", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailsForm;
