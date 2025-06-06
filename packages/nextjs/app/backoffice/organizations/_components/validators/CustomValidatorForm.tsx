import React from "react";
import { isAddress } from "viem";

type ParamType = "string" | "address" | "uint256";

interface AbiParam {
  type: ParamType;
  value: string;
}

interface CustomValidatorFormProps {
  parameterData: Record<string, string | string[]>;
  handleParameterChange: (newParams: Record<string, string | string[]>) => void;
}

export const CustomValidatorForm: React.FC<CustomValidatorFormProps> = ({ parameterData, handleParameterChange }) => {
  // Parse abiParams from JSON string or default to []
  const abiParams: AbiParam[] = (() => {
    try {
      if (typeof parameterData.abiParams === "string") {
        return JSON.parse(parameterData.abiParams) as AbiParam[];
      }
    } catch {
      return [];
    }
    return [];
  })();

  // Handle address or validatorUID change
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleParameterChange({ [e.target.name]: e.target.value });
  };

  // Handle abiParam changes (type/value)
  const handleAbiParamChange = (idx: number, key: "type" | "value", value: string) => {
    const newParams = abiParams.slice();
    newParams[idx] = { ...newParams[idx], [key]: value };
    handleParameterChange({ abiParams: JSON.stringify(newParams) });
  };

  const addAbiParam = () => {
    handleParameterChange({
      abiParams: JSON.stringify([...abiParams, { type: "string", value: "" }]),
    });
  };

  const removeAbiParam = (idx: number) => {
    handleParameterChange({
      abiParams: JSON.stringify(abiParams.filter((_, i) => i !== idx)),
    });
  };

  const addressValue = typeof parameterData.address === "string" ? parameterData.address : "";
  const addressValid = addressValue === "" || isAddress(addressValue);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          Contract Address
        </label>
        <input
          type="text"
          name="address"
          placeholder="Enter the validator contract address"
          value={addressValue}
          onChange={handleFieldChange}
          className={`w-full px-3 py-2 rounded-lg border ${
            addressValid ? "border-gray-300 dark:border-gray-700" : "border-red-500"
          } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition`}
        />
        {!addressValid && <p className="text-xs text-red-500 mt-1">Invalid Ethereum address</p>}
      </div>
      <div>
        <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          Validator UID
        </label>
        <input
          type="text"
          name="validatorUID"
          placeholder="Enter the validator UID"
          value={typeof parameterData.validatorUID === "string" ? parameterData.validatorUID : ""}
          onChange={handleFieldChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
      {/* ABI Params Section */}
      <div>
        <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          ABI Parameters
        </label>
        {abiParams.length === 0 && <div className="text-xs text-gray-400 mb-2">No parameters defined yet.</div>}
        {abiParams.map((param, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <select
              aria-label={`Parameter ${idx + 1} type`}
              value={param.type}
              onChange={e => handleAbiParamChange(idx, "type", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="string">string</option>
              <option value="address">address</option>
              <option value="uint256">uint256</option>
            </select>
            <input
              type="text"
              value={param.value}
              onChange={e => handleAbiParamChange(idx, "value", e.target.value)}
              className="border rounded px-2 py-1 flex-1"
              placeholder={`Enter ${param.type} value`}
            />
            <button
              type="button"
              onClick={() => removeAbiParam(idx)}
              className="text-red-500 hover:underline text-xs"
              title="Remove"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addAbiParam} className="mt-1 text-blue-500 hover:underline text-xs">
          + Add Parameter
        </button>
      </div>
    </div>
  );
};
