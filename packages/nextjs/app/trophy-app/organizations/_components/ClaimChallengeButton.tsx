"use client";

import React, { useState } from "react";
import ClaimChallengeBasicButton from "~~/app/backoffice/organizations/_components/ClaimChallengeBasicButton";
import ClaimChallengeSecretModal from "~~/app/backoffice/organizations/_components/ClaimChallengeSecretModal";
import ClaimChallengeTwoStepButton from "~~/app/backoffice/organizations/_components/ClaimChallengeTwoStepButton";
import { ValidatorContractName, getContractName } from "~~/app/backoffice/organizations/_components/KnownValidators";

interface ClaimChallengeButtonProps {
  orgId: bigint;
  challengeId: bigint;
  validatorUID: string;
}

export const ClaimChallengeButton: React.FC<ClaimChallengeButtonProps> = ({ orgId, challengeId, validatorUID }) => {
  const [showSecretModal, setShowSecretModal] = useState(false);

  const contractName: ValidatorContractName | undefined = getContractName(validatorUID);

  if (validatorUID === "SecretValidatorV1") {
    return (
      <>
        <button className="btn btn-primary btn-sm" onClick={() => setShowSecretModal(true)}>
          Claim Reward
        </button>
        {showSecretModal && (
          <ClaimChallengeSecretModal challengeId={challengeId} onClose={() => setShowSecretModal(false)} />
        )}
      </>
    );
  }

  if (contractName) {
    return <ClaimChallengeTwoStepButton challengeId={challengeId} contractName={contractName} />;
  } else {
    return <ClaimChallengeBasicButton orgId={orgId} challengeId={challengeId} />;
  }
};
