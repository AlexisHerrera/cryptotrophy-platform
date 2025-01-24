"use client";

import React, { useEffect, useState } from "react";
import ClaimChallengeModal from "./ClaimChallengeModal";
import { formatUnits } from "ethers";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface ChallengeListProps {
  orgId: bigint;
  challengeIds: bigint[];
}

const ChallengeList: React.FC<ChallengeListProps> = ({ orgId, challengeIds }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<bigint | null>(null);
  console.log("SelectedChallengeId", selectedChallengeId);

  // Hook para obtener los detalles de los desafíos
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CryptoTrophyPlatform",
    functionName: "listChallengesDetails",
    args: [challengeIds],
  });

  // Hook para obtener los decimales del token
  const { data: decimalsData } = useScaffoldReadContract({
    contractName: "CryptoTrophyPlatform",
    functionName: "getTokenDecimals",
    args: [orgId],
  });

  const [decimalsNumber, setDecimalsNumber] = useState<number | null>(null);

  useEffect(() => {
    if (decimalsData) {
      setDecimalsNumber(Number(decimalsData));
    }
  }, [decimalsData]);

  useEffect(() => {
    if (!isLoading && data && decimalsNumber !== null) {
      const formattedChallenges = data[0].map((id: bigint, index: number) => ({
        id,
        description: data[1][index],
        prizeAmount: formatUnits(data[2][index], decimalsNumber), // Convertir prizeAmount
        startTime: new Date(Number(data[3][index]) * 1000).toLocaleString(),
        endTime: new Date(Number(data[4][index]) * 1000).toLocaleString(),
        maxWinners: data[5][index],
        active: data[6][index],
        winnerCount: data[7][index],
      }));

      setChallenges(formattedChallenges);
    }
  }, [data, isLoading, decimalsNumber]);

  if (isLoading || decimalsNumber === null) {
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
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedChallengeId(challenge.id)}>
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

      {selectedChallengeId !== null && (
        <ClaimChallengeModal
          orgId={orgId}
          challengeId={selectedChallengeId}
          onClose={() => setSelectedChallengeId(null)}
        />
      )}
    </div>
  );
};

export default ChallengeList;
