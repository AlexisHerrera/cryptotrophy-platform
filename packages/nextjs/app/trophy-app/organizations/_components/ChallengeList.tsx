"use client";

import React, { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { decodeBytes32String } from "ethers";
import {
  ValidatorContractName,
  getContractName,
  getValidatorDisplayName,
} from "~~/app/backoffice/organizations/_components//KnownValidators";
import ClaimChallengeBasicButton from "~~/app/backoffice/organizations/_components/ClaimChallengeBasicButton";
import ClaimChallengeOnChainModal from "~~/app/backoffice/organizations/_components/ClaimChallengeOnChainModal";
import ClaimChallengeSecretModal from "~~/app/backoffice/organizations/_components/ClaimChallengeSecretModal";
import ClaimChallengeTwoStepButton from "~~/app/backoffice/organizations/_components/ClaimChallengeTwoStepButton";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

// Wrapper to hide children if challenge is not active

interface ActiveChallengeWrapperProps {
  challengeActive: boolean;
  children: React.ReactNode;
}

const ActiveChallengeWrapper: React.FC<ActiveChallengeWrapperProps> = ({ challengeActive, children }) => {
  return challengeActive ? <>{children}</> : <span className="text-gray-500">Closed</span>;
};

// Creates the correct button type depending on validatorUID

function createClaimChallengeButton(
  orgId: bigint,
  challengeId: bigint,
  validatorUID: string,
  onSecretCodeChallenge: (id: bigint, validatorUID: string) => void,
) {
  // For SecretValidatorV1, we'll show a special button that triggers the secret input modal
  if (validatorUID === "SecretValidatorV1") {
    return (
      <button className="btn btn-primary btn-sm" onClick={() => onSecretCodeChallenge(challengeId, validatorUID)}>
        Claim Reward
      </button>
    );
  }

  const contractName: ValidatorContractName = getContractName(validatorUID);
  if (contractName) {
    return <ClaimChallengeTwoStepButton challengeId={challengeId} contractName={contractName} />;
  } else {
    return <ClaimChallengeBasicButton orgId={orgId} challengeId={challengeId} />;
  }
}

// List of challenges for an organization

interface ChallengeListProps {
  orgId: bigint;
  challengeIds: readonly bigint[];
}

const ChallengeList: React.FC<ChallengeListProps> = ({ orgId, challengeIds }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    id: bigint;
    hasValidator: boolean;
    validatorUID: string;
  } | null>(null);
  const [challengeValidator, setChallengeValidator] = useState<{
    id: bigint;
    hasValidator: boolean;
    validatorUID: string;
  } | null>(null);
  const [secretCodeChallenge, setSecretCodeChallenge] = useState<{
    id: bigint;
    validatorUID: string;
  } | null>(null);
  const [mockValidatorResponse, setMockValidatorResponse] = useState<{ id: bigint; validatorUID: string } | null>(null);
  console.log("SelectedChallengeId", selectedChallenge?.id);

  // Hook para obtener los detalles de los desafíos
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "listChallengesDetails",
    args: [challengeIds],
  });

  useEffect(() => {
    if (!isLoading && data) {
      const formattedChallenges = data[0].map((id: bigint, index: number) => ({
        id,
        description: data[1][index],
        prizeAmount: formatUnits(data[2][index], DECIMALS_TOKEN), // Convertir prizeAmount
        startTime: new Date(Number(data[3][index]) * 1000).toLocaleString(),
        endTime: new Date(Number(data[4][index]) * 1000).toLocaleString(),
        maxWinners: data[5][index],
        active: data[6][index],
        winnerCount: data[7][index],
        validatorUID: decodeBytes32String(data[8][index]),
        hasValidator: data[8][index] !== "0x0000000000000000000000000000000000000000000000000000000000000000",
      }));

      setChallenges(formattedChallenges);
    }
  }, [data, isLoading]);

  // Handler for secret code challenge button
  const handleSecretCodeChallenge = (challengeId: bigint, validatorUID: string) => {
    setSecretCodeChallenge({
      id: challengeId,
      validatorUID: validatorUID,
    });
  };

  if (isLoading) {
    return <p>Loading challenges...</p>;
  }

  if (!challenges.length) {
    return <p>No active challenges.</p>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <table className="table table-zebra border border-gray-200 shadow-lg text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Prize</th>
            <th>Status</th>
            <th>Max Winners</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge, index) => (
            <tr key={index} className="hover">
              <td>{challenge.id.toString()}</td>
              <td>{challenge.description}</td>
              <td>{challenge.prizeAmount} tokens</td>
              <td>{challenge.active ? "Active" : "Inactive"}</td>
              <td>{challenge.maxWinners.toString()}</td>
              <td>{challenge.startTime}</td>
              <td>{challenge.endTime}</td>
              <td>
                <ActiveChallengeWrapper challengeActive={challenge.active}>
                  {createClaimChallengeButton(orgId, challenge.id, challenge.validatorUID, handleSecretCodeChallenge)}
                </ActiveChallengeWrapper>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedChallenge !== null &&
        selectedChallenge.hasValidator &&
        selectedChallenge.validatorUID === "OnChainValidatorV1" && (
          <ClaimChallengeOnChainModal
            orgId={orgId}
            challengeId={selectedChallenge.id}
            onClose={() => setSelectedChallenge(null)}
          />
        )}

      {secretCodeChallenge !== null && (
        <ClaimChallengeSecretModal challengeId={secretCodeChallenge.id} onClose={() => setSecretCodeChallenge(null)} />
      )}
    </div>
  );
};

export default ChallengeList;
