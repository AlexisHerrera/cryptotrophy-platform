import React, { useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimChallengeTwoStepModalProps {
  orgId: bigint;
  challengeId: bigint;
  contractName: "OffChainValidator" | "RandomValidator";
  onClose: () => void;
}

const ClaimChallengeTwoStepModal: React.FC<ClaimChallengeTwoStepModalProps> = ({
  orgId,
  challengeId,
  contractName,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const { writeContractAsync: challengeManager } = useScaffoldWriteContract("ChallengeManager");
  const { writeContractAsync: twoStepValidator } = useScaffoldWriteContract(contractName);

  const { data: validatorConfig } = useScaffoldReadContract({
    contractName: contractName,
    functionName: "getConfig",
    args: [challengeId],
  });
  const { data: validationState } = useScaffoldReadContract({
    contractName: contractName,
    functionName: "getValidationState",
    args: [challengeId],
  });

  const { address: connectedAddress } = useAccount();
  const claimState = validationState === undefined ? "PENDING REQUEST" : JSON.parse(validationState)["state"];

  const handlePreValidation = async () => {
    if (validatorConfig !== undefined) {
      try {
        setLoading(true);
        console.log("Org ID", orgId, "Challenge ID", challengeId);

        await twoStepValidator({
          functionName: "preValidation",
          args: [challengeId, "0x"],
        });

        onClose();
      } catch (error) {
        console.error("Error in pre validation step:", error);
        alert("Failed to pre validate. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClaim = async () => {
    if (validatorConfig !== undefined) {
      try {
        setLoading(true);
        console.log("Org ID", orgId, "Challenge ID", challengeId);
        const abiCoder = new ethers.AbiCoder();
        const params = abiCoder.encode(["address[1]"], [[connectedAddress]]);

        await challengeManager({
          functionName: "claimReward",
          args: [challengeId, params as `0x${string}`],
        });

        alert("Reward claimed successfully!");
        onClose();
      } catch (error) {
        console.error("Error claiming reward:", error);
        alert("Failed to claim reward. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Claim Reward - Current state: {claimState}</h2>

        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          {claimState !== "SUCCESS" && (
            <button className="btn btn-primary" onClick={handlePreValidation} disabled={loading}>
              {loading ? "Pre validacion..." : "Pre validacion"}
            </button>
          )}
          {claimState === "SUCCESS" && (
            <button className="btn btn-primary" onClick={handleClaim} disabled={loading}>
              {loading ? "Claim..." : "Claim Reward"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ClaimChallengeTwoStepModal;
