"use client";

import React, { useEffect, useState } from "react";
import ClaimChallengeModal from "./ClaimChallengeModal";
import { formatUnits } from "ethers";
import ClaimChallengeBasic from "~~/app/organizations/_components/ClaimChallengeBasic";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

interface ChallengeListProps {
  orgId: bigint;
  challengeIds: readonly bigint[];
}

const ChallengeList: React.FC<ChallengeListProps> = ({ orgId, challengeIds }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<{ id: bigint; hasValidator: boolean } | null>(null);
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
        hasValidator: data[8][index],
      }));

      setChallenges(formattedChallenges);
    }
  }, [data, isLoading, DECIMALS_TOKEN]);

  if (isLoading || DECIMALS_TOKEN === null) {
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
                {challenge.active ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedChallenge({ id: challenge.id, hasValidator: challenge.hasValidator })}
                  >
                    Claim Reward
                  </button>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedChallenge !== null && selectedChallenge.hasValidator && (
        <ClaimChallengeModal
          orgId={orgId}
          challengeId={selectedChallenge.id}
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
    </div>
  );
};

export default ChallengeList;
