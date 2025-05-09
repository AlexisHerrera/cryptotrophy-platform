import React, { useRef, useState } from "react";
import { buildPoseidon } from "circomlibjs";
import { encodeBytes32String } from "ethers";
import { parseEther } from "viem";
import Modal from "~~/components/Modal";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface AdminSetChallengeValidatorProps {
  orgId: bigint;
  challengeId: bigint;
  validatorUID: string;
  onClose: () => void;
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

const AdminSetChallengeValidator: React.FC<AdminSetChallengeValidatorProps> = ({
  orgId,
  challengeId,
  validatorUID,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(validatorUID);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [codeCount, setCodeCount] = useState<number>(5);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showCodesPopup, setShowCodesPopup] = useState(false);
  const [successProbability, setSuccessProbability] = useState<number>(0);
  const [ethAmount, setEthAmount] = useState<string>("0");
  const codesRef = useRef<HTMLDivElement>(null);

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const algorithm = e.target.value;
    setSelectedAlgorithm(algorithm);
    // Optionally reset parameters when switching algorithms:
    setFormData({});
  };
  console.log("selectedAlgorithm", selectedAlgorithm);

  const { writeContractAsync: validatorRegistry } = useScaffoldWriteContract("ValidatorRegistry");
  const { writeContractAsync: onChainValidator } = useScaffoldWriteContract("OnChainValidator");
  const { writeContractAsync: OffChainApiValidator } = useScaffoldWriteContract("OffChainApiValidator");
  const { writeContractAsync: secretValidator } = useScaffoldWriteContract("SecretValidator");
  const { writeContractAsync: RandomValidator } = useScaffoldWriteContract("RandomValidator");

  const { data: challengeContract } = useScaffoldContract({ contractName: "ChallengeManager" });

  // Function to calculate the Poseidon hash of a string
  const calculateSecretHash = async (secretStr: string): Promise<bigint> => {
    // Skip empty strings
    if (!secretStr.trim()) return 0n;

    try {
      const poseidon = await buildPoseidon();
      // Convert string to numeric representation
      const secret = BigInt(Buffer.from(secretStr).reduce((acc, byte) => acc * 256n + BigInt(byte), 0n));

      // Calculate hash using Poseidon with 1 input (just the secret)
      const hash = poseidon.F.toString(poseidon([secret]));
      console.log(`Secret code "${secretStr}" hashed to: ${hash}`);
      return BigInt(hash);
    } catch (error) {
      console.error("Error calculating hash:", error);
      alert(`Failed to hash secret code: ${secretStr}`);
      return 0n;
    }
  };

  const handleSetValidator = async () => {
    try {
      setLoading(true);
      console.log(
        "AdminSetChallengeValidator.handleSetValidator",
        "Org ID",
        orgId,
        "Challenge ID",
        challengeId,
        "selectedAlgorithm",
        selectedAlgorithm,
      );

      let challangeAddress = "0x";
      if (challengeContract !== undefined) {
        challangeAddress = challengeContract.address;
      }

      if (selectedAlgorithm === "OnChainValidatorV1") {
        // Configure public hash in validator
        const publicHash = BigInt(formData.challengeHash);
        await onChainValidator({
          functionName: "setConfig",
          args: [challengeId, publicHash],
        });
      } else if (selectedAlgorithm === "OffChainValidatorV2") {
        console.log("Set config", formData.url, formData.path);
        // Configure url and path for challenge.
        await OffChainApiValidator({
          functionName: "setConfig",
          args: [challengeId, formData.url, formData.path, challangeAddress],
        });
      } else if (selectedAlgorithm === "SecretValidatorV1") {
        console.log("Processing secret codes", formData.secretCodes);
        // Parse the secret codes from the textarea
        const secretCodes = formData.secretCodes.split("\n").filter(line => line.trim() !== "");

        // Calculate hashes for each secret code
        const hashes = await Promise.all(secretCodes.map(code => calculateSecretHash(code.trim())));

        // Filter out any failed hashes (0n)
        const validHashes = hashes.filter(hash => hash !== 0n);

        if (validHashes.length === 0) {
          throw new Error("No valid secret codes provided");
        }

        console.log(`Adding ${validHashes.length} secret hashes to validator`);

        // Add the valid hashes to the validator
        await secretValidator({
          functionName: "setConfig",
          args: [challengeId, validHashes],
        });
      } else if (selectedAlgorithm === "RandomValidatorV1") {
        console.log("Set config", formData.successProbability);
        if (challangeAddress === undefined) {
          throw new Error("Invalid challangeAddress address");
        }
        const successProbability = BigInt(formData.successProbability);
        const requiredPaymentWei = BigInt(formData.requiredPaymentWei);
        await RandomValidator({
          functionName: "setConfig",
          args: [challengeId, successProbability, challangeAddress, requiredPaymentWei],
        });
      } else {
        throw new Error("Invalid validator");
      }

      const encodedValidatorUID = encodeBytes32String(selectedAlgorithm);
      await validatorRegistry({
        functionName: "setChallengeValidator",
        args: [challengeId, encodedValidatorUID as `0x${string}`, challengeId],
      });

      alert("Validator updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating validator:", error);
      alert("Failed to update the validator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChangeEvent = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e.target.name, e.target.value);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Generate random secret codes
  const handleGenerateCodes = () => {
    const count = Math.min(Math.max(1, codeCount), 100); // Limit between 1 and 100
    const codes = Array.from({ length: count }, () => generateRandomCode(8));
    setGeneratedCodes(codes);
    setFormData({ ...formData, secretCodes: codes.join("\n") });
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
    <Modal onClose={onClose}>
      <div className="p-6 bg-base-100">
        <h2 className="text-xl font-bold mb-4 text-center text-primary">Configure Validator</h2>
        <p className="mb-6 text-center text-base-content">
          Setting validator for challenge: <strong>{challengeId.toString()}</strong>
        </p>

        {/* Algorithm Selection */}
        <div className="mb-6">
          <label htmlFor="algorithm-select" className="block mb-2 font-medium text-base-content">
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

        <div className="flex flex-col gap-4">
          {selectedAlgorithm === "OnChainValidatorV1" && (
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Public Hash</span>
              </label>
              <textarea
                name="challengeHash"
                placeholder="Set the full public hash for the challenge"
                value={formData.challengeHash}
                onChange={handleInputChangeEvent}
                className="textarea textarea-bordered w-full bg-base-200 text-base-content"
              />
            </div>
          )}

          {(selectedAlgorithm === "OffChainValidatorV1" || selectedAlgorithm === "OffChainValidatorV2") && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">External URL</span>
                </label>
                <textarea
                  name="url"
                  placeholder="Set the external url that should be called"
                  value={formData.url}
                  onChange={handleInputChangeEvent}
                  className="textarea textarea-bordered w-full bg-base-200 text-base-content"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">JSON Path</span>
                </label>
                <textarea
                  name="path"
                  placeholder="Set the path in the json response with the validation result"
                  value={formData.path}
                  onChange={handleInputChangeEvent}
                  className="textarea textarea-bordered w-full bg-base-200 text-base-content"
                />
              </div>
            </>
          )}

          {selectedAlgorithm === "SecretValidatorV1" && (
            <div className="form-control">
              <label className="label">
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

              <div className="bg-base-200 p-4 rounded-lg">
                <div className="flex items-end gap-2 mb-4">
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
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
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Generated Codes:</span>
                        <span className="badge badge-primary">{generatedCodes.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={() => setShowCodesPopup(true)}>
                          View Codes
                        </button>
                        <button
                          className={`btn btn-sm ${codeCopied ? "btn-success" : "btn-info"}`}
                          onClick={handleCopyAllCodes}
                        >
                          {codeCopied ? (
                            <span className="flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
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

                    <div className="bg-warning/10 border border-warning p-3 rounded-md mb-3">
                      <div className="flex items-start gap-2 text-warning-content">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 flex-shrink-0"
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
              <label className="label">
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
                    handleInputChange("successProbability", Math.round(percentageValue * 100).toString());
                  }
                }}
                className="input input-bordered w-full bg-base-200 text-base-content"
              />
              <label className="label">
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
                    handleInputChange("requiredPaymentWei", amountInWei.toString());
                  }
                }}
                className="input input-bordered w-full bg-base-200 text-base-content"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSetValidator}
            disabled={loading || (selectedAlgorithm === "SecretValidatorV1" && generatedCodes.length === 0)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Setting Validator...
              </span>
            ) : (
              "Set Validator"
            )}
          </button>
        </div>
      </div>

      {/* Codes Popup */}
      {showCodesPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowCodesPopup(false)}
        >
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full p-4 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
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

            <div className="flex justify-end mt-4 gap-2">
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
    </Modal>
  );
};

export default AdminSetChallengeValidator;
