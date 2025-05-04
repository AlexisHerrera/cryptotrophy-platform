import React, { useRef, useState } from "react";
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

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newParameterData = { ...parameterData, [e.target.name]: e.target.value };
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
      <div className="p-4 bg-base-100">
        <h2 className="text-xl font-bold mb-1 text-center text-primary">Configure Validator</h2>
        <p className="mb-3 text-center text-base-content">Setting validator for new challenge</p>

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

        <div className="flex flex-col gap-3">
          {selectedAlgorithm === "OnChainValidatorV1" && (
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-base-content">Public Hash</span>
              </label>
              <textarea
                name="challengeHash"
                placeholder="Set the full public hash for the challenge"
                value={parameterData.challengeHash}
                onChange={handleParameterChange}
                className="textarea textarea-bordered w-full bg-base-200 text-base-content"
              />
            </div>
          )}

          {(selectedAlgorithm === "OffChainValidatorV1" || selectedAlgorithm === "OffChainValidatorV2") && (
            <>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-base-content">External URL</span>
                </label>
                <textarea
                  name="url"
                  placeholder="Set the external url that should be called"
                  value={parameterData.url}
                  onChange={handleParameterChange}
                  className="textarea textarea-bordered w-full bg-base-200 text-base-content"
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-base-content">JSON Path</span>
                </label>
                <textarea
                  name="path"
                  placeholder="Set the path in the json response with the validation result"
                  value={parameterData.path}
                  onChange={handleParameterChange}
                  className="textarea textarea-bordered w-full bg-base-200 text-base-content"
                />
              </div>
            </>
          )}

          {selectedAlgorithm === "SecretValidatorV1" && (
            <div className="form-control">
              <label className="label py-1">
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

              <div className="bg-base-200 p-3 rounded-lg">
                {/* Single line for input and all buttons */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="form-control flex-1">
                    <label className="label py-1">
                      <span className="label-text">How many codes?</span>
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

                  <div className="flex items-center gap-2 mt-7">
                    <button
                      className="btn btn-circle btn-primary"
                      onClick={handleGenerateCodes}
                      aria-label="Generate codes"
                      title="Generate codes"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>

                    {generatedCodes.length > 0 && (
                      <>
                        <button
                          className="btn btn-circle btn-secondary"
                          onClick={() => setShowCodesPopup(true)}
                          aria-label="View codes"
                          title="View codes"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        <button
                          className={`btn btn-circle ${codeCopied ? "btn-success" : "btn-info"}`}
                          onClick={handleCopyAllCodes}
                          aria-label={codeCopied ? "Copied!" : "Copy all codes"}
                          title={codeCopied ? "Copied!" : "Copy all codes"}
                        >
                          {codeCopied ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Generated Codes Summary */}
                {generatedCodes.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">{generatedCodes.length} Codes Generated</span>
                  </div>
                )}

                {/* Warning Message */}
                {generatedCodes.length > 0 && (
                  <div className="bg-warning/10 border border-warning p-2 rounded-md">
                    <div className="flex items-start gap-2 text-warning-content text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 flex-shrink-0 mt-0.5"
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
                      <span>Codes can&apos;t be recovered later</span>
                      <div
                        className="tooltip tooltip-left"
                        data-tip="These codes will be stored in a hashed format and cannot be recovered later. Please make sure to copy and save them now."
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-info cursor-help"
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedAlgorithm === "RandomValidatorV1" && (
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-base-content">Probabilities</span>
              </label>
              <textarea
                name="successProbability"
                placeholder="Set the challenge success probability"
                value={parameterData.successProbability}
                onChange={handleParameterChange}
                className="textarea textarea-bordered w-full bg-base-200 text-base-content"
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
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full p-4 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Secret Codes</h3>
              <button className="btn btn-sm btn-circle" onClick={() => setShowCodesPopup(false)}>
                ✕
              </button>
            </div>

            <div ref={codesRef} className="bg-base-200 p-3 rounded-lg overflow-auto max-h-[300px] font-mono text-sm">
              {generatedCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                  <span className="badge badge-sm">{index + 1}</span>
                  <code>{code}</code>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-3 gap-2">
              <button
                className={`btn btn-sm ${codeCopied ? "btn-success" : "btn-primary"}`}
                onClick={handleCopyAllCodes}
              >
                {codeCopied ? "Copied!" : "Copy All Codes"}
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setShowCodesPopup(false)}>
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
