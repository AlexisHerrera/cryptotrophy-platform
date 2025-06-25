"use client";

import React, { useEffect, useState } from "react";
import AdminSetChallengeValidator from "./AdminSetChallengeValidator";
import ClaimChallengeBasicButton from "./ClaimChallengeBasicButton";
import ClaimChallengeOnChainModal from "./ClaimChallengeOnChainModal";
import ClaimChallengeSecretModal from "./ClaimChallengeSecretModal";
import ClaimChallengeTwoStepButton from "./ClaimChallengeTwoStepButton";
import MockExternalValidatorFulfill from "./MockExternalValidatorFulfill";
import { formatUnits } from "ethers";
import { decodeBytes32String } from "ethers";
import { useChainId } from "wagmi";
import {
  ValidatorContractName,
  getContractName,
  getValidatorDisplayName,
} from "~~/app/backoffice/organizations/_components/KnownValidators";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

const LOCAL_CHAIN_ID = 31337; // Hardhat default

const AdditionalHeaders = ({ mode, isLocal }: { mode: "user" | "admin"; isLocal: boolean }) => {
  if (mode === "admin") {
    return (
      <>
        <th>Admin</th>
        {isLocal && <th>Local&nbsp;Network</th>}
      </>
    );
  }

  return <th>Claim</th>;
};

interface AdminColumnsCellsProps {
  challenge: any;
  onConfigureValidator: (challenge: any) => void;
  onMockValidator: (challenge: any) => void;
  isLocal: boolean;
}

const AdminColumnsCells: React.FC<AdminColumnsCellsProps> = ({
  challenge,
  onConfigureValidator,
  onMockValidator,
  isLocal,
}) => (
  <>
    {/* Configure column – always shown */}
    <td>
      <ActiveChallengeWrapper challengeActive={challenge.active}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() =>
            onConfigureValidator({
              id: challenge.id,
              hasValidator: challenge.hasValidator,
              validatorUID: challenge.validatorUID,
            })
          }
        >
          Configure Validator
        </button>
      </ActiveChallengeWrapper>
    </td>

    {/* Mock column – only on Hardhat local network */}
    {isLocal && (
      <td>
        <ActiveChallengeWrapper challengeActive={challenge.active}>
          {challenge.hasValidator ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                onMockValidator({
                  id: challenge.id,
                  validatorUID: challenge.validatorUID,
                })
              }
            >
              Mock Validator
            </button>
          ) : (
            <span className="text-gray-500">Missing Validator</span>
          )}
        </ActiveChallengeWrapper>
      </td>
    )}
  </>
);

interface UserColumnsCellsProps {
  challenge: any;
  orgId: bigint;
  handleSecretCodeChallenge: (id: bigint, validatorUID: string) => void;
}

const UserColumnCells: React.FC<UserColumnsCellsProps> = ({ challenge, orgId, handleSecretCodeChallenge }) => {
  return (
    <td>
      <ActiveChallengeWrapper challengeActive={challenge.active}>
        {createClaimChallengeButton(orgId, challenge.id, challenge.validatorUID, handleSecretCodeChallenge)}
      </ActiveChallengeWrapper>
    </td>
  );
};
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
  mode: "user" | "admin";
}

const ChallengeList: React.FC<ChallengeListProps> = ({ orgId, challengeIds, mode }) => {
  const chainId = useChainId();
  const isLocal = chainId === LOCAL_CHAIN_ID;

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
            <th>Loot</th>
            <th className="hidden md:table-cell">Status</th>
            <th className="hidden lg:table-cell">Validator</th>
            <th className="hidden lg:table-cell">Max Winners</th>
            <th className="hidden xl:table-cell">Start Time</th>
            <th className="hidden xl:table-cell">End Time</th>
            <AdditionalHeaders mode={mode} isLocal={isLocal} />
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge, index) => (
            <tr key={index} className="hover">
              <td>{challenge.id.toString()}</td>
              <td className="max-w-xs">
                <div className="tooltip tooltip-left" data-tip={challenge.description}>
                  <span className="line-clamp-4 whitespace-pre-line">{challenge.description}</span>
                </div>
              </td>
              <td>{challenge.prizeAmount} tokens</td>
              <td className="hidden md:table-cell">{challenge.active ? "Active" : "Inactive"}</td>
              <td className="hidden lg:table-cell">
                {challenge.hasValidator ? (
                  <span className="">{getValidatorDisplayName(challenge.validatorUID)}</span>
                ) : (
                  <span className="badge badge-ghost">No Validator</span>
                )}
              </td>
              <td className="hidden lg:table-cell">{challenge.maxWinners.toString()}</td>
              <td className="hidden xl:table-cell">{challenge.startTime}</td>
              <td className="hidden xl:table-cell">{challenge.endTime}</td>
              {mode === "admin" ? (
                <AdminColumnsCells
                  challenge={challenge}
                  onConfigureValidator={setChallengeValidator}
                  onMockValidator={setMockValidatorResponse}
                  isLocal={isLocal}
                />
              ) : (
                <UserColumnCells
                  challenge={challenge}
                  orgId={orgId}
                  handleSecretCodeChallenge={handleSecretCodeChallenge}
                />
              )}
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

      {challengeValidator !== null && (
        <AdminSetChallengeValidator
          orgId={orgId}
          challengeId={challengeValidator.id}
          validatorUID={challengeValidator ? challengeValidator.validatorUID : ""}
          onClose={() => setChallengeValidator(null)}
        />
      )}

      {mockValidatorResponse !== null && (
        <MockExternalValidatorFulfill
          orgId={orgId}
          challengeId={mockValidatorResponse.id}
          validatorUID={mockValidatorResponse ? mockValidatorResponse.validatorUID : ""}
          onClose={() => setMockValidatorResponse(null)}
        />
      )}
    </div>
  );
};

export default ChallengeList;
