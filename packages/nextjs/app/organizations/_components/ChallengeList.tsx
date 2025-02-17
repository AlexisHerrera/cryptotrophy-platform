"use client";

import React, { useEffect, useState } from "react";
import ClaimChallengeOnChainModal from "./ClaimChallengeOnChainModal";
import ClaimChallengeTwoStepModal from "./ClaimChallengeTwoStepModal";
import { formatUnits } from "ethers";
import { decodeBytes32String } from "ethers";
import AdminSetChallengeValidator from "~~/app/organizations/_components/AdminSetChallengeValidator";
import ClaimChallengeBasic from "~~/app/organizations/_components/ClaimChallengeBasic";
import MockExternalValidatorResponse from "~~/app/organizations/_components/MockExternalValidatorResponse";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

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
            <th>Admin</th>
            <th>Local Network</th>
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
                {challenge.active ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      setSelectedChallenge({
                        id: challenge.id,
                        hasValidator: challenge.hasValidator,
                        validatorUID: challenge.validatorUID,
                      })
                    }
                  >
                    Claim Reward
                  </button>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </td>
              <td>
                {true ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      setChallengeValidator({
                        id: challenge.id,
                        hasValidator: challenge.hasValidator,
                        validatorUID: challenge.validatorUID,
                      })
                    }
                  >
                    Configure Validator
                  </button>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </td>
              <td>
                {challenge.hasValidator ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setMockValidatorResponse({ id: challenge.id, validatorUID: challenge.validatorUID })}
                  >
                    Mock Validator
                  </button>
                ) : (
                  <span className="text-gray-500">Missing Validator</span>
                )}
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
      {selectedChallenge !== null &&
        selectedChallenge.hasValidator &&
        selectedChallenge.validatorUID === "OffChainValidatorV1" && (
          <ClaimChallengeTwoStepModal
            orgId={orgId}
            challengeId={selectedChallenge.id}
            contractName="OffChainValidator"
            onClose={() => setSelectedChallenge(null)}
          />
        )}
      {selectedChallenge !== null &&
        selectedChallenge.hasValidator &&
        selectedChallenge.validatorUID === "RandomValidatorV1" && (
          <ClaimChallengeTwoStepModal
            orgId={orgId}
            challengeId={selectedChallenge.id}
            contractName="RandomValidator"
            onClose={() => setSelectedChallenge(null)}
          />
        )}
      {selectedChallenge !== null && !selectedChallenge.hasValidator && (
        <ClaimChallengeBasic
          orgId={orgId}
          challengeId={selectedChallenge.id}
          onClose={() => setSelectedChallenge(null)}
        />
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
        <MockExternalValidatorResponse
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
