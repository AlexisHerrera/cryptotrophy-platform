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

  const { writeContractAsync: createRewardContract } = useScaffoldWriteContract("RewardSystem");
  const { writeContractAsync: claimRewardContract } = useScaffoldWriteContract("RewardSystem");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimData, setClaimData] = useState<{ campaignId: bigint; secret: string }>({
    campaignId: BigInt(0),
    secret: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    ethPerClaim: "",
    secret: "",
    fundAmount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClaimInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClaimData({ ...claimData, [e.target.name]: e.target.value });
  };

  const handleCreateReward = async () => {
    try {
      const { name, ethPerClaim, secret, fundAmount } = formData;
      const secretHash = keccak256(toUtf8Bytes(secret)) as `0x${string}`;

      await createRewardContract({
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

  const handleClaimReward = async () => {
    try {
      const { campaignId, secret } = claimData;
      const secretHash = keccak256(toUtf8Bytes(secret)) as `0x${string}`;

      await claimRewardContract({
        functionName: "claimReward",
        args: [campaignId, secretHash],
      });

      // Cerrar el modal en caso de éxito al reclamar la recompensa
      setIsClaimModalOpen(false);
      setClaimData({ campaignId: BigInt(0), secret: "" });
    } catch (error) {
      console.error("Error claiming reward:", error);
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id, index) => (
              <tr key={id.toString()} className="hover">
                <td>{id.toString()}</td>
                <td>{names[index]}</td>
                <td>{Number(ethPerClaims[index]) / 1e18} ETH</td>
                <td>{Number(totalFunds[index]) / 1e18} ETH</td>
                <td>
                  {Number(totalFunds[index]) > 0 ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setClaimData({ campaignId: ids[index], secret: "" });
                        setIsClaimModalOpen(true);
                      }}
                    >
                      Claim Reward
                    </button>
                  ) : (
                    <span className="text-gray-400">No Funds Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4 text-center">Create New Reward</h2>
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

      {isClaimModalOpen && (
        <Modal onClose={() => setIsClaimModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4 text-center">Claim Reward</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="secret"
              placeholder="Enter Secret Number"
              value={claimData.secret}
              onChange={handleClaimInputChange}
              className="input input-bordered w-full"
            />
            <button className="btn btn-primary" onClick={handleClaimReward}>
              Claim
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PanelPage;
