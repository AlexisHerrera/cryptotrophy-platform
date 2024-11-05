"use client";

import React, { FC, useState } from "react";
import { keccak256, parseEther, toUtf8Bytes } from "ethers";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const PanelPage: FC = () => {
  const { data: campaignsData, isLoading } = useScaffoldReadContract({
    contractName: "RewardSystem",
    functionName: "getAllCampaignDetails",
  });

  const { writeContractAsync } = useScaffoldWriteContract("RewardSystem");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ethPerClaim: "",
    secret: "",
    fundAmount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateReward = async () => {
    try {
      const { name, ethPerClaim, secret, fundAmount } = formData;

      const secretHash = keccak256(toUtf8Bytes(secret)) as `0x${string}`;

      await writeContractAsync({
        functionName: "createReward",
        args: [name, parseEther(ethPerClaim), secretHash],
        value: parseEther(fundAmount),
      });

      setIsModalOpen(false);
      setFormData({ name: "", ethPerClaim: "", secret: "", fundAmount: "" });
    } catch (error) {
      console.error("Error creating reward:", error);
    }
  };

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
      <button className="btn btn-primary mb-4" onClick={() => setIsModalOpen(true)}>
        Create New Reward
      </button>
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

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Create New Reward</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Campaign Name"
              value={formData.name}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="ethPerClaim"
              placeholder="Reward per Claim (ETH)"
              value={formData.ethPerClaim}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="secret"
              placeholder="Secret Number"
              value={formData.secret}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="fundAmount"
              placeholder="Fund Amount (ETH)"
              value={formData.fundAmount}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <button className="btn btn-primary" onClick={handleCreateReward}>
              Submit
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PanelPage;
