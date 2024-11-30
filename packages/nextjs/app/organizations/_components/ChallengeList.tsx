"use client";

import React, { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface ChallengeListProps {
  challengeIds: bigint[];
}

const ChallengeList: React.FC<ChallengeListProps> = ({ challengeIds }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "CryptoTrophyPlatform",
    functionName: "listChallengesDetails",
    args: [challengeIds],
  });

  useEffect(() => {
    if (!isLoading && data) {
      const formattedChallenges = data[0].map((id: bigint, index: number) => ({
        id,
        description: data[1][index],
        prizeAmount: data[2][index],
        startTime: new Date(Number(data[3][index]) * 1000).toLocaleString(),
        endTime: new Date(Number(data[4][index]) * 1000).toLocaleString(),
        maxWinners: data[5][index],
        active: data[6][index],
        winnerCount: data[7][index],
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
    <div className="overflow-x-auto">
      <table className="table w-full border border-gray-200 shadow-lg text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Prize</th>
            <th>Status</th>
            <th>Max Winners</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge, index) => (
            <tr key={index}>
              <td>{challenge.id.toString()}</td>
              <td>{challenge.description}</td>
              <td>{challenge.prizeAmount.toString()} tokens</td>
              <td>{challenge.active ? "Active" : "Inactive"}</td>
              <td>{challenge.maxWinners.toString()}</td>
              <td>{challenge.startTime}</td>
              <td>{challenge.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChallengeList;
