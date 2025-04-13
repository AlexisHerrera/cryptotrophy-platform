import React, { useState } from "react";
import { buildPoseidon } from "circomlibjs";
import { encodeBytes32String } from "ethers";
import Modal from "~~/components/Modal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface AdminSetChallengeValidatorProps {
  orgId: bigint;
  challengeId: bigint;
  validatorUID: string;
  onClose: () => void;
}

const AdminSetChallengeValidator: React.FC<AdminSetChallengeValidatorProps> = ({
  orgId,
  challengeId,
  validatorUID,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(validatorUID);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const algorithm = e.target.value;
    setSelectedAlgorithm(algorithm);
    // Optionally reset parameters when switching algorithms:
    setFormData({});
  };
  console.log("selectedAlgorithm", selectedAlgorithm);

  const { writeContractAsync: validatorRegistry } = useScaffoldWriteContract("ValidatorRegistry");
  const { writeContractAsync: onChainValidator } = useScaffoldWriteContract("OnChainValidator");
  const { writeContractAsync: offChainValidator } = useScaffoldWriteContract("OffChainValidator");
  const { writeContractAsync: OffChainApiValidator } = useScaffoldWriteContract("OffChainApiValidator");
  const { writeContractAsync: secretValidator } = useScaffoldWriteContract("SecretValidator");

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

      if (selectedAlgorithm === "OnChainValidatorV1") {
        // Configure public hash in validator
        const publicHash = BigInt(formData.challengeHash);
        await onChainValidator({
          functionName: "setConfig",
          args: [challengeId, publicHash],
        });
      } else if (selectedAlgorithm === "OffChainValidatorV1") {
        console.log("Set config", formData.url, formData.path);
        // Configure url and path for challenge.
        await offChainValidator({
          functionName: "setConfig",
          args: [challengeId, formData.url, formData.path],
        });
      } else if (selectedAlgorithm === "OffChainValidatorV2") {
        console.log("Set config", formData.url, formData.path);
        // Configure url and path for challenge.
        await OffChainApiValidator({
          functionName: "setConfig",
          args: [challengeId, formData.url, formData.path],
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
          functionName: "addValidHashes",
          args: [challengeId, validHashes],
        });
      } else if (selectedAlgorithm === "RandomValidatorV1") {
        // PENDING CONFIGURATION
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Configure Validator</h2>
        <p className="mb-4 text-center">
          Setting validator for challenge: <strong>{challengeId.toString()}</strong>?
        </p>

        {/* Algorithm Selection */}
        <div className="mb-4">
          <label htmlFor="algorithm-select" className="block mb-1">
            Select Algorithm/Function
          </label>
          <select
            id="algorithm-select"
            value={selectedAlgorithm}
            onChange={handleAlgorithmChange}
            className="select select-bordered w-full"
          >
            <option value="">Sin Validar</option>
            <option value="OnChainValidatorV1">On Chain</option>
            <option value="OffChainValidatorV1">Off Chain</option>
            <option value="OffChainValidatorV2">Off Chain (Function)</option>
            <option value="SecretValidatorV1">Secret Codes</option>
            <option value="RandomValidatorV1">Random</option>
          </select>
        </div>

        <div className="flex flex-col gap-4">
          {selectedAlgorithm === "OnChainValidatorV1" && (
            <>
              <textarea
                name="challengeHash"
                placeholder="Set the full public hash for the challenge"
                value={formData.challengeHash}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full"
              />
            </>
          )}

          {(selectedAlgorithm === "OffChainValidatorV1" || selectedAlgorithm === "OffChainValidatorV2") && (
            <>
              <textarea
                name="url"
                placeholder="Set the external url that should be called"
                value={formData.url}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full"
              />
              <textarea
                name="path"
                placeholder="Set the path in the json response with the validation result"
                value={formData.path}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full"
              />
            </>
          )}

          {selectedAlgorithm === "SecretValidatorV1" && (
            <>
              <div className="text-sm mb-2 text-info">
                Enter each secret code on a new line. These will be hashed using Poseidon before being stored.
              </div>
              <textarea
                name="secretCodes"
                placeholder="Enter secret codes (one per line, e.g. SUMMER2024)"
                value={formData.secretCodes}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full"
                rows={5}
              />
            </>
          )}

          {selectedAlgorithm === "RandomValidatorV1" && (
            <>
              <textarea
                name="probabilities"
                placeholder="Set the challenge probabilities"
                value={formData.probabilities}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full"
              />
            </>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSetValidator} disabled={loading}>
            {loading ? "Setting Validator..." : "Set Validator"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminSetChallengeValidator;
