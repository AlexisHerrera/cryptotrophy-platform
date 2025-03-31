import React, { useState } from "react";
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
