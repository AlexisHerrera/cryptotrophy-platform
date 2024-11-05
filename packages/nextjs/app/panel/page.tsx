"use client";

import { FC } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const PanelPage: FC = () => {
  const { data: campaignsData, isLoading } = useScaffoldReadContract({
    contractName: "RewardSystem",
    functionName: "getAllCampaignDetails",
  });

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!campaignsData) {
    return <p>No campaigns found.</p>;
  }

  const [ids, names, ethPerClaims, totalFunds] = campaignsData as [
    readonly bigint[],
    readonly string[],
    readonly bigint[],
    readonly bigint[],
  ];
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      <div className="overflow-x-auto">
        <table className="table w-full border border-gray-200 shadow-lg">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Reward (ETH)</th>
              <th>Total Remaining (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id, index) => (
              <tr key={id.toString()} className="hover">
                <td>{id.toString()}</td>
                <td>{names[index]}</td>
                <td>{Number(ethPerClaims[index]) / 1e18} ETH</td>
                <td>{Number(totalFunds[index]) / 1e18} ETH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PanelPage;
