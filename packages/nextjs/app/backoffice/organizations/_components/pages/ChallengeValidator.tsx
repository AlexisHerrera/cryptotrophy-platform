import React, { useState } from "react";
import { CustomValidatorForm } from "../validators/CustomValidatorForm";
import { OffChainValidatorForm } from "../validators/OffChainValidatorForm";
import { RandomValidatorForm } from "../validators/RandomValidatorForm";
import { SecretValidatorForm } from "../validators/SecretValidatorForm";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface SetChallengeValidatorProps {
  formData: ChallengeData;
  handleInputChange: (field: keyof ChallengeData, value: string | Record<string, any> | bigint) => void;
}

const SetChallengeValidator: React.FC<SetChallengeValidatorProps> = ({ formData, handleInputChange }) => {
  const [parameterData, setParameterData] = useState<Record<string, string | string[]>>(formData.params);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(formData.selectedValidator);

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlgorithm(e.target.value);
    handleInputChange("selectedValidator", e.target.value);
  };

  const handleParameterChange = (newParams: Record<string, string | string[]>) => {
    const updated = { ...parameterData, ...newParams };
    setParameterData(updated);
    handleInputChange("params", updated);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 font-sans max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">Configure Validator</h2>

      {/* Algorithm Selection */}
      <div className="mb-4">
        <label
          htmlFor="algorithm-select"
          className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider"
        >
          Select Algorithm/Function
        </label>
        <select
          id="algorithm-select"
          value={selectedAlgorithm}
          onChange={handleAlgorithmChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">Without Validator</option>
          <option value="OffChainValidatorV2">Off Chain API</option>
          <option value="SecretValidatorV1">Secret Codes</option>
          <option value="CustomValidator">Custom Contract</option>
          <option value="RandomValidatorV1">Random</option>
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {(selectedAlgorithm === "OffChainValidatorV1" || selectedAlgorithm === "OffChainValidatorV2") && (
          <OffChainValidatorForm parameterData={parameterData} handleParameterChange={handleParameterChange} />
        )}
        {selectedAlgorithm === "CustomValidator" && (
          <CustomValidatorForm parameterData={parameterData} handleParameterChange={handleParameterChange} />
        )}
        {selectedAlgorithm === "SecretValidatorV1" && (
          <SecretValidatorForm parameterData={parameterData} handleParameterChange={handleParameterChange} />
        )}
        {selectedAlgorithm === "RandomValidatorV1" && (
          <RandomValidatorForm parameterData={parameterData} handleParameterChange={handleParameterChange} />
        )}
      </div>
    </div>
  );
};

export default SetChallengeValidator;
