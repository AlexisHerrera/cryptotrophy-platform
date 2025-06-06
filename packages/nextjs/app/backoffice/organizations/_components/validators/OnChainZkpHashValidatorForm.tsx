import React from "react";

interface OnChainZkpHashValidatorFormProps {
  parameterData: Record<string, string>;
  handleParameterChange: (newParams: Record<string, string | string[]>) => void;
}

export const OnChainZkpHashValidatorForm: React.FC<OnChainZkpHashValidatorFormProps> = ({
  parameterData,
  handleParameterChange,
}) => {
  // Handles input changes, batching changes
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleParameterChange({ [e.target.name]: e.target.value });
  };

  return (
    <div>
      <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
        Public Hash
      </label>
      <textarea
        name="challengeHash"
        placeholder="Set the full public hash for the challenge"
        value={typeof parameterData.challengeHash === "string" ? parameterData.challengeHash : ""}
        onChange={handleFieldChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  );
};
