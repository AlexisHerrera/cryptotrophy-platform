import React, { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

interface RandomValidatorFormProps {
  parameterData: Record<string, string | string[]>;
  handleParameterChange: (newParams: Record<string, string | string[]>) => void;
}

export const RandomValidatorForm: React.FC<RandomValidatorFormProps> = ({ parameterData, handleParameterChange }) => {
  // Local state for display purposes
  const [successProbability, setSuccessProbability] = useState<number>(() => {
    const raw = parameterData.successProbability;
    if (typeof raw === "string" && !isNaN(Number(raw))) {
      return Number(raw) / 100;
    }
    return 0;
  });

  const [ethAmount, setEthAmount] = useState<string>(() => {
    const raw = parameterData.requiredPaymentWei;
    if (typeof raw === "string") {
      try {
        return formatEther(BigInt(raw));
      } catch {
        return "";
      }
    }
    return "";
  });

  const { data: RandomValidator } = useScaffoldContract({ contractName: "RandomValidator" });
  useEffect(() => {
    if (RandomValidator?.address) {
      handleParameterChange({ RandomValidatorAddress: RandomValidator.address });
    }
  }, [RandomValidator?.address]);

  // Sync local state with parameterData if parent changes it
  useEffect(() => {
    const raw = parameterData.successProbability;
    if (typeof raw === "string" && !isNaN(Number(raw))) {
      setSuccessProbability(Number(raw) / 100);
    }
    const rawEth = parameterData.requiredPaymentWei;
    if (typeof rawEth === "string") {
      try {
        setEthAmount(formatEther(BigInt(rawEth)));
      } catch {
        setEthAmount("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameterData.successProbability, parameterData.requiredPaymentWei]);

  // Handle probability UI change
  const onProbabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setSuccessProbability(val);
      handleParameterChange({
        successProbability: Math.round(val * 100).toString(),
      });
    }
  };

  // Handle ETH UI change
  const onEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ethStr = e.target.value;
    setEthAmount(ethStr);
    try {
      const amountInWei = parseEther(ethStr);
      handleParameterChange({ requiredPaymentWei: amountInWei.toString() });
    } catch {
      handleParameterChange({ requiredPaymentWei: "0" });
    }
  };

  return (
    <div>
      <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
        Success Probability (%)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="100"
        name="successProbabilityDisplay"
        placeholder="Set the challenge success probability (e.g., 85.5)"
        value={successProbability}
        onChange={onProbabilityChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
      />

      <label className="block mt-2 mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
        Required ETH
      </label>
      <input
        type="number"
        step="0.00001"
        min="0"
        name="ethAmountDisplay"
        placeholder="Enter amount in ETH (e.g., 0.01)"
        value={ethAmount}
        onChange={onEthChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  );
};
