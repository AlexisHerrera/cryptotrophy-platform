import React, { useEffect } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

interface OffChainValidatorFormProps {
  parameterData: Record<string, string | string[]>;
  handleParameterChange: (newParams: Record<string, string | string[]>) => void;
}

export const OffChainValidatorForm: React.FC<OffChainValidatorFormProps> = ({
  parameterData,
  handleParameterChange,
}) => {
  const { data: OffChainApiValidator } = useScaffoldContract({ contractName: "OffChainApiValidator" });

  useEffect(() => {
    if (OffChainApiValidator?.address) {
      handleParameterChange({ OffChainApiValidatorAddress: OffChainApiValidator.address });
    }
  }, [OffChainApiValidator?.address]);

  // Handles input changes for url and path, batching changes
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleParameterChange({ [e.target.name]: e.target.value });
  };

  return (
    <>
      <div>
        <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          External URL
        </label>
        <textarea
          name="url"
          placeholder="Set the external url that should be called"
          value={typeof parameterData.url === "string" ? parameterData.url : ""}
          onChange={handleFieldChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
      <div>
        <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          JSON Path
        </label>
        <textarea
          name="path"
          placeholder="Set the path in the json response with the validation result"
          value={typeof parameterData.path === "string" ? parameterData.path : ""}
          onChange={handleFieldChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
    </>
  );
};
