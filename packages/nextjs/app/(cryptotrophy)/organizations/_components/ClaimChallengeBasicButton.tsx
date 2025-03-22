"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClaimRewardButtonProps {
  orgId: bigint;
  challengeId: bigint;
}

const ClaimChallengeBasicButton: React.FC<ClaimRewardButtonProps> = ({ orgId, challengeId }) => {
  console.log("ClaimRewardButton Org ID", orgId, "Challenge ID", challengeId);
  const [loading, setLoading] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState<boolean>(true);

  const { writeContractAsync: claimReward } = useScaffoldWriteContract("ChallengeManager");

  const handleButtonClick = async () => {
    console.log("handleButtonClick Org ID", orgId, "Challenge ID", challengeId);
    // Disable the button right away
    setButtonEnabled(false);
    setLoading(true);
    try {
      await claimReward({
        functionName: "claimReward",
        args: [challengeId, "0x"],
      });
      setLoading(false);
      setButtonEnabled(true);
      alert("Reward claimed successfully!");
    } catch (error) {
      console.error("Error during reward claiming process:", error);
      setLoading(false);
      setButtonEnabled(true);
    }
  };

  return (
    <div>
      <button className="btn btn-primary btn-sm" onClick={handleButtonClick} disabled={loading || !buttonEnabled}>
        Claim Reward
      </button>
    </div>
  );
};

export default ClaimChallengeBasicButton;
