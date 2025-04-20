import React, { useState } from "react";
import { ValidatorContractName } from "./KnownValidators";
import Modal from "~~/components/Modal";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { fetchLatestOffChainApiRequestId } from "~~/utils/cryptotrophyIndex/offChainApiValidator";
import { fetchLatestRandomValidatorRequestId } from "~~/utils/cryptotrophyIndex/randomValidator";

type FetchValidatorRequestId = () => Promise<string | null>;

type ExecuteExternalFulfillFunction = (
  validatorContractAddress: string,
  lastRequestId: `0x${string}`,
  mockWriteContract: any,
  formData: Record<string, string>,
) => void;

interface CreateFulfillFormProps {
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

// Functions for Offchain fullfill

const executeExternalOffchainFulfill: ExecuteExternalFulfillFunction = async (
  validatorContractAddress,
  lastRequestId,
  mockWriteContract,
  formData,
) => {
  await mockWriteContract({
    functionName: "callFulfill",
    args: [validatorContractAddress, lastRequestId, formData.onChainMockSuccess === "on"],
  });
};

const OffchainFulfillForm: React.FC<CreateFulfillFormProps> = ({ formData, setFormData }) => {
  const handleChackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked === true ? "on" : "off" });
  };
  return (
    <>
      <div className="mb-4 text-center">
        <label className="mb-4 text-center">
          Success:{" "}
          <input
            name="onChainMockSuccess"
            type="checkbox"
            checked={formData["onChainMockSuccess"] === "on"}
            onChange={handleChackChange}
          />
          <span></span>
        </label>
        <span></span>
      </div>
    </>
  );
};

// Functions for Random fullfill

const executeExternalRandomFulfill: ExecuteExternalFulfillFunction = async (
  validatorContractAddress,
  lastRequestId,
  mockWriteContract,
  formData,
) => {
  if (formData.randomMockNumber !== undefined) {
    await mockWriteContract({
      functionName: "fulfillRandomWordsWithOverride",
      args: [BigInt(lastRequestId), validatorContractAddress, [BigInt(formData.randomMockNumber)]],
    });
  }
};

const RandomFulfillForm: React.FC<CreateFulfillFormProps> = ({ formData, setFormData }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <>
      <div className="mb-4 text-center">
        <label className="mb-4 text-center">
          Random number:{" "}
          <input
            name="randomMockNumber"
            type="number"
            value={formData["randomMockNumber"]}
            onChange={handleInputChange}
          />
          <span></span>
        </label>
        <span></span>
      </div>
    </>
  );
};

// Initialize mock config

function initMockConfig(
  validatorUID: string,
): [
  ValidatorContractName,
  "OracleMock" | "ChainlinkVrfCoordinatorMock" | "RouterMock",
  FetchValidatorRequestId,
  ExecuteExternalFulfillFunction,
  React.FC<CreateFulfillFormProps>,
] {
  if (validatorUID == "RandomValidatorV1") {
    return [
      "RandomValidator",
      "ChainlinkVrfCoordinatorMock",
      fetchLatestRandomValidatorRequestId,
      executeExternalRandomFulfill,
      RandomFulfillForm,
    ];
  } else if (validatorUID == "OffChainValidatorV2") {
    return [
      "OffChainApiValidator",
      "RouterMock",
      fetchLatestOffChainApiRequestId,
      executeExternalOffchainFulfill,
      OffchainFulfillForm,
    ];
  }
  throw new Error("Unknown validatorUID.");
}

// Main component

interface MockExternalOffchainValidatorProps {
  orgId: bigint;
  challengeId: bigint;
  validatorUID: string;
  onClose: () => void;
}

const MockExternalValidatorFulfill: React.FC<MockExternalOffchainValidatorProps> = ({
  challengeId,
  onClose,
  validatorUID,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [validatorContractName, mockContractName, fetchLatestRequestId, executeExternalFulfill, FulfillForm] =
    initMockConfig(validatorUID);
  const { writeContractAsync: mockWriteContract } = useScaffoldWriteContract(mockContractName as any);

  const { data: deployedContract } = useScaffoldContract({ contractName: validatorContractName });

  const handleMock = async () => {
    try {
      setLoading(true);

      const latestRequestId = await fetchLatestRequestId();

      if (deployedContract !== undefined && latestRequestId !== undefined && latestRequestId !== null) {
        executeExternalFulfill(deployedContract.address, latestRequestId as `0x${string}`, mockWriteContract, formData);
      } else {
        throw new Error("Error during validator configuration.");
      }

      console.log("Mock respoinse simulated successfully!");
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

        <FulfillForm formData={formData} setFormData={setFormData} />

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

export default MockExternalValidatorFulfill;
