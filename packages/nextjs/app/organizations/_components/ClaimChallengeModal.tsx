import React, { useState } from "react";
import Modal from "~~/components/Modal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimChallengeModalProps {
  orgId: bigint;
  challengeId: bigint;
  onClose: () => void;
}

const ClaimChallengeModal: React.FC<ClaimChallengeModalProps> = ({ orgId, challengeId, onClose }) => {
  const [loading, setLoading] = useState(false);

  const { writeContractAsync: claimReward } = useScaffoldWriteContract("CryptoTrophyPlatform");

  const handleClaim = async () => {
    try {
      setLoading(true);
      console.log("Org ID", orgId, "Challenge ID", challengeId);
      await claimReward({
        functionName: "claimReward",
        args: [orgId, challengeId],
      });
      alert("Reward claimed successfully!");
      onClose();
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Claim Reward</h2>
        <p className="mb-4 text-center">
          Are you sure you want to claim the reward for challenge <strong>{challengeId.toString()}</strong>?
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleClaim} disabled={loading}>
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimChallengeModal;
