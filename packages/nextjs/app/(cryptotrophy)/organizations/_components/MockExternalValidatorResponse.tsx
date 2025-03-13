import React, { useEffect, useState } from "react";
import Modal from "~~/components/Modal";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface MockExternalValidatorResponseProps {
  orgId: bigint;
  challengeId: bigint;
  validatorUID: string;
  onClose: () => void;
}

const MockExternalValidatorResponse: React.FC<MockExternalValidatorResponseProps> = ({
  orgId,
  challengeId,
  validatorUID,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { writeContractAsync: oracleMock } = useScaffoldWriteContract("OracleMock");
  const { writeContractAsync: vrfCoordinatorMock } = useScaffoldWriteContract("ChainlinkVrfCoordinatorMock");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  let validatorContractName: "OffChainValidator" | "RandomValidator";
  if (validatorUID === "OffChainValidatorV1") {
    validatorContractName = "OffChainValidator";
  } else if (validatorUID === "RandomValidatorV1") {
    validatorContractName = "RandomValidator";
  } else {
    throw new Error("Error during validator configuration.");
  }

  const { data: lastRequestId } = useScaffoldReadContract({
    contractName: validatorContractName,
    functionName: "lastRequestId",
  });
  const { data: deployedContract } = useScaffoldContract({ contractName: validatorContractName });

  const handleMock = async () => {
    try {
      setLoading(true);
      console.log("Org ID", orgId, "Challenge ID", challengeId, "validatorUID", validatorUID);

      if (validatorUID === "OffChainValidatorV1" && deployedContract !== undefined && lastRequestId !== undefined) {
        await oracleMock({
          functionName: "callFulfill",
          args: [deployedContract.address, lastRequestId, formData.onChainMockSuccess === "on"],
        });
      } else if (
        validatorUID === "RandomValidatorV1" &&
        deployedContract !== undefined &&
        formData.randomMockNumber !== undefined &&
        lastRequestId !== undefined
      ) {
        await vrfCoordinatorMock({
          functionName: "fulfillRandomWordsWithOverride",
          args: [BigInt(lastRequestId), deployedContract.address, [BigInt(formData.randomMockNumber)]],
        });
      } else {
        throw new Error("Error during validator configuration.");
      }

      alert("Mock respoinse simulated successfully!");
      onClose();
    } catch (error) {
      console.error("Error mocking response:", error);
      alert("Failed to mock response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Mock Validator Response</h2>
        <p className="mb-4 text-center">
          Mocking external validator response: <strong>{challengeId.toString()}</strong>?
        </p>

        {validatorUID === "OffChainValidatorV1" && (
          <>
            <div className="mb-4 text-center">
              <label className="mb-4 text-center">
                Success:{" "}
                <input
                  name="onChainMockSuccess"
                  type="checkbox"
                  value={formData.onChainMockSuccess}
                  onChange={handleInputChange}
                />
                <span></span>
              </label>
              <span></span>
            </div>
          </>
        )}

        {validatorUID === "RandomValidatorV1" && (
          <>
            <div className="mb-4 text-center">
              <label className="mb-4 text-center">
                Random number:{" "}
                <input
                  name="randomMockNumber"
                  type="number"
                  value={formData.randomMockNumber}
                  onChange={handleInputChange}
                />
                <span></span>
              </label>
              <span></span>
            </div>
          </>
        )}

        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleMock} disabled={loading}>
            {loading ? "Mocking Response..." : "Mock Response"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MockExternalValidatorResponse;
