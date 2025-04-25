// components/ChallengeCard.tsx
import React from "react";
import { formatUnits } from "ethers";
import { getContractName } from "~~/app/backoffice/organizations/_components//KnownValidators";
import ClaimChallengeBasicButton from "~~/app/backoffice/organizations/_components/ClaimChallengeBasicButton";
import ClaimChallengeTwoStepButton from "~~/app/backoffice/organizations/_components/ClaimChallengeTwoStepButton";
import { Challenge } from "~~/utils/cryptotrophyIndex/challenges";

export const ChallengeCard: React.FC<{ item: Challenge }> = ({ item: challenge }) => {
  console.log(challenge);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-bold dark:text-white mb-2">Challenge #{challenge.id}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-1">{challenge.description}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-1">
        Prize: {formatUnits(BigInt(challenge.prizeAmount), 18)} tokens
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-1">Max Winners: {challenge.maxWinners}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-1">
        {new Date(Number(challenge.startTime) * 1000).toLocaleString()} →{" "}
        {new Date(Number(challenge.endTime) * 1000).toLocaleString()}
      </p>
      <div className="mt-2">
        {challenge.active ? <span className="text-gray-500">TODO</span> : <span className="text-gray-500">Closed</span>}
      </div>
    </div>
  );
};
