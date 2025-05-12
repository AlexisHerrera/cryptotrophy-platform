import React, { useRef, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface SetChallengeValidatorProps {
  formData: ChallengeData;
  handleInputChange: (field: keyof ChallengeData, value: string | Record<string, any> | bigint) => void;
}

// Function to generate a random code
const generateRandomCode = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar-looking characters
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const SetChallengeValidator: React.FC<SetChallengeValidatorProps> = ({ formData, handleInputChange }) => {
  const [parameterData, setParameterData] = useState<Record<string, string | string[]>>(formData.params);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(formData.validatorUID);
  const [codeCount, setCodeCount] = useState<number>(formData.params.generatedCodes?.length ?? 5);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>(formData.params.generatedCodes ?? []);
  const [successProbability, setSuccessProbability] = useState<number>(
    typeof formData.params.successProbability === "string" ? parseFloat(formData.params.successProbability) / 100 : 0,
  );
  const [ethAmount, setEthAmount] = useState<string>(
    typeof formData.params.requiredPaymentWei === "string"
      ? formatEther(BigInt(formData.params.requiredPaymentWei))
      : "0",
  );
  const [codeCopied, setCodeCopied] = useState(false);
  const [showCodesPopup, setShowCodesPopup] = useState(false);
  const codesRef = useRef<HTMLDivElement>(null);

  const { data: onChainValidator } = useScaffoldContract({ contractName: "OnChainValidator" });
  const { data: OffChainApiValidator } = useScaffoldContract({ contractName: "OffChainApiValidator" });
  const { data: secretValidator } = useScaffoldContract({ contractName: "SecretValidator" });
  const { data: RandomValidator } = useScaffoldContract({ contractName: "RandomValidator" });

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const algorithm = e.target.value;
    setSelectedAlgorithm(algorithm);
    // Optionally reset parameters when switching algorithms:
    handleInputChange("validatorUID", e.target.value);
    let validatorAddress: string | undefined = "0x0000000000000000000000000000000000000000";
    if (e.target.value !== "" && e.target.value !== undefined) {
      const validatorAddresses: Record<string, string | undefined> = {
        OnChainValidatorV1: onChainValidator?.address,
        OffChainValidatorV2: OffChainApiValidator?.address,
        SecretValidatorV1: secretValidator?.address,
        RandomValidatorV1: RandomValidator?.address,
      };
      validatorAddress = validatorAddresses[e.target.value];
      if (validatorAddress === "0x0000000000000000000000000000000000000000" || validatorAddress === undefined) {
        throw new Error("Validator address could not be read.");
      }
    }
    handleInputChange("validatorAddress", validatorAddress);
  };

  const handleParameterChangeEvent = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleParameterChange(e.target.name, e.target.value);
  };

  const handleParameterChange = (name: string, value: string) => {
    const newParameterData = { ...parameterData, [name]: value };
    setParameterData(newParameterData);
    handleInputChange("params", newParameterData);
  };

  // Generate random secret codes
  const handleGenerateCodes = () => {
    const count = Math.min(Math.max(1, codeCount), 100); // Limit between 1 and 100
    const codes = Array.from({ length: count }, () => generateRandomCode(8));
    setGeneratedCodes(codes);

    const newParameterData = { ...parameterData, ["secretCodes"]: codes.join("\n"), ["generatedCodes"]: codes };
    setParameterData(newParameterData);
    handleInputChange("params", newParameterData);
    setCodeCopied(false);
  };

  // Copy all generated codes to clipboard
  const handleCopyAllCodes = () => {
    if (generatedCodes.length > 0) {
      navigator.clipboard
        .writeText(generatedCodes.join("\n"))
        .then(() => {
          setCodeCopied(true);
          setTimeout(() => setCodeCopied(false), 3000);
        })
        .catch(err => {
          console.error("Failed to copy codes: ", err);
          alert("Failed to copy codes to clipboard");
        });
    }
  };

  return (
    <div>
      <div className="p-2 bg-base-100">
        <h2 className="text-xl font-bold mb-2 text-center text-primary">Configure Validator</h2>

        {/* Algorithm Selection */}
        <div className="mb-3">
          <label htmlFor="algorithm-select" className="block mb-1 font-medium text-base-content">
            Select Algorithm/Function
          </label>
          <select
            id="algorithm-select"
            value={selectedAlgorithm}
            onChange={handleAlgorithmChange}
            className="select select-bordered w-full bg-base-200 text-base-content"
          >
            <option value="">Sin Validar</option>
            <option value="OnChainValidatorV1">On Chain</option>
            <option value="OffChainValidatorV2">Off Chain</option>
            <option value="SecretValidatorV1">Secret Codes</option>
            <option value="RandomValidatorV1">Random</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          {selectedAlgorithm === "OnChainValidatorV1" && (
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-base-content">Public Hash</span>
              </label>
              <textarea
                name="challengeHash"
                placeholder="Set the full public hash for the challenge"
                value={parameterData.challengeHash}
                onChange={handleParameterChangeEvent}
                className="textarea textarea-bordered w-full bg-base-200 text-base-content"
              />
            </div>
          )}

          {(selectedAlgorithm === "OffChainValidatorV1" || selectedAlgorithm === "OffChainValidatorV2") && (
            <>
              <div className="form-control">
                <label className="label py-0">
                  <span className="label-text text-base-content">External URL</span>
                </label>
                <textarea
                  name="url"
                  placeholder="Set the external url that should be called"
                  value={parameterData.url}
                  onChange={handleParameterChangeEvent}
                  className="textarea textarea-bordered w-full bg-base-200 text-base-content"
                />
              </div>
              <div className="form-control">
                <label className="label py-0">
                  <span className="label-text text-base-content">JSON Path</span>
                </label>
                <textarea
                  name="path"
                  placeholder="Set the path in the json response with the validation result"
                  value={parameterData.path}
                  onChange={handleParameterChangeEvent}
                  className="textarea textarea-bordered w-full bg-base-200 text-base-content"
                />
              </div>
            </>
          )}

          {selectedAlgorithm === "SecretValidatorV1" && (
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-base-content font-medium">Secret Codes Generator</span>
                <span className="label-text-alt">
                  <div
                    className="tooltip tooltip-left"
                    data-tip="Codes are hashed with Poseidon and stored on-chain. Only the hash is stored, making the original codes unrecoverable once set."
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-info cursor-help"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </span>
              </label>

              <div className="bg-base-200 p-2 rounded-lg">
                <div className="flex items-end gap-2 mb-2">
                  <div className="form-control w-full max-w-xs">
                    <label className="label py-0">
                      <span className="label-text">Number of codes to generate</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={codeCount}
                      onChange={e => setCodeCount(Number(e.target.value))}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleGenerateCodes}>
                    Generate Codes
                  </button>
                </div>

                {/* Generated Codes Summary */}
                {generatedCodes.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Generated Codes:</span>
                        <span className="badge badge-primary">{generatedCodes.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-xs btn-secondary" onClick={() => setShowCodesPopup(true)}>
                          View Codes
                        </button>
                        <button
                          className={`btn btn-xs ${codeCopied ? "btn-success" : "btn-info"}`}
                          onClick={handleCopyAllCodes}
                        >
                          {codeCopied ? (
                            <span className="flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </span>
                          ) : (
                            "Copy All"
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-warning/10 border border-warning p-2 rounded-md mb-2">
                      <div className="flex items-start gap-1 text-warning-content text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span>
                          <strong>Important:</strong> These codes will be stored in a hashed format and cannot be
                          recovered later. Please make sure to copy and save them now.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedAlgorithm === "RandomValidatorV1" && (
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-base-content">Success Probability (%)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="successProbabilityDisplay"
                placeholder="Set the challenge success probability (e.g., 85.5)"
                value={successProbability}
                onChange={e => {
                  const percentageValue = parseFloat(e.target.value);
                  if (!isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100) {
                    setSuccessProbability(percentageValue);
                    handleParameterChange("successProbability", Math.round(percentageValue * 100).toString());
                  }
                }}
                className="input input-bordered w-full bg-base-200 text-base-content"
              />
              <label className="label py-0 pt-1">
                <span className="label-text text-base-content">Required ETH</span>
              </label>
              <input
                type="number"
                step="0.00001"
                min="0"
                name="ethAmountDisplay"
                placeholder="Enter amount in ETH (e.g., 0.01)"
                value={ethAmount}
                onChange={e => {
                  const amountInWei = parseEther(e.target.value);
                  if (amountInWei >= 0) {
                    setEthAmount(e.target.value);
                    handleParameterChange("requiredPaymentWei", amountInWei.toString());
                  }
                }}
                className="input input-bordered w-full bg-base-200 text-base-content"
              />
            </div>
          )}
        </div>
      </div>

      {/* Codes Popup */}
      {showCodesPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowCodesPopup(false)}
        >
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full p-3 m-2" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Secret Codes</h3>
              <button className="btn btn-xs btn-circle" onClick={() => setShowCodesPopup(false)}>
                ✕
              </button>
            </div>

            <div ref={codesRef} className="bg-base-200 p-2 rounded-lg overflow-auto max-h-[250px] font-mono text-sm">
              {generatedCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-1 mb-1">
                  <span className="badge badge-xs">{index + 1}</span>
                  <code>{code}</code>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-2 gap-1">
              <button
                className={`btn btn-xs ${codeCopied ? "btn-success" : "btn-primary"}`}
                onClick={handleCopyAllCodes}
              >
                {codeCopied ? "Copied!" : "Copy All Codes"}
              </button>
              <button className="btn btn-xs btn-outline" onClick={() => setShowCodesPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetChallengeValidator;
