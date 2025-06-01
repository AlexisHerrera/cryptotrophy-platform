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
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 space-y-6 font-sans max-w-xl mx-auto">
      {/* Description */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1"
        >
          Challenge Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Describe your challenge (e.g., complete the task in 7 days)"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
        />
      </div>

      {/* Prize + Winners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {/* Prize */}
        <div className="space-y-2">
          <label
            htmlFor="prizeAmount"
            className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1"
          >
            Number of tokens given to Winner
          </label>
          <input
            id="prizeAmount"
            type="number"
            min="0"
            step="any"
            placeholder="Amount"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
            value={formData.prizeAmount || ""}
            onChange={e => handleNumber("prizeAmount", e.target.value)}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">Max {formattedMax}</span>
        </div>

        {/* Max winners */}
        <div className="space-y-2">
          <label
            htmlFor="maxWinners"
            className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1"
          >
            Maximum Number of Winners
          </label>
          <input
            id="maxWinners"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 1"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
            value={formData.maxWinners || ""}
            onChange={e => handleNumber("maxWinners", e.target.value)}
          />
        </div>
      </div>

      {/* Start + End */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {/* Start */}
        <div className="space-y-2">
          <label
            htmlFor="startTime"
            className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1"
          >
            Start Time
          </label>
          <input
            id="startTime"
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
            value={formData.startTime}
            onChange={e => handleInputChange("startTime", e.target.value)}
          />
        </div>

        {/* End */}
        <div className="space-y-2">
          <label
            htmlFor="endTime"
            className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1"
          >
            End Time
          </label>
          <input
            id="endTime"
            type="datetime-local"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
            value={formData.endTime}
            onChange={e => handleInputChange("endTime", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailsForm;
