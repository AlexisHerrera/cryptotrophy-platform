"use client";

import React, { useState } from "react";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Organization {
  id: bigint;
  name: string;
  token: string;
  adminCount: bigint;
  userCount: bigint;
  isMember: boolean;
}

const Organizations: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Leer organizaciones desde el contrato
  const { data: organizationsData, isLoading } = useScaffoldReadContract({
    contractName: "CryptoTrophyPlatform",
    functionName: "listOrganizationsWithDetails",
  });

  // Funciones para unirse o salir
  const { writeContractAsync: joinOrganization } = useScaffoldWriteContract("CryptoTrophyPlatform");
  const { writeContractAsync: leaveOrganization } = useScaffoldWriteContract("CryptoTrophyPlatform");

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!organizationsData) {
    return <p>No organizations found.</p>;
  }

  const [orgIds, names, tokens, adminCounts, userCounts, isMembers] = organizationsData as [
    readonly bigint[],
    readonly string[],
    readonly string[],
    readonly bigint[],
    readonly bigint[],
    readonly boolean[],
  ];

  const organizations: Organization[] = orgIds.map((id, index) => ({
    id,
    name: names[index],
    token: tokens[index],
    adminCount: adminCounts[index],
    userCount: userCounts[index],
    isMember: isMembers[index],
  }));

  const handleJoin = async (organization: Organization) => {
    try {
      setLoadingAction(true);
      await joinOrganization({
        functionName: "joinOrganization",
        args: [organization.id],
      });
      alert(`Successfully joined ${organization.name}!`);
      setSelectedOrganization(null);
    } catch (error) {
      console.error("Error joining organization:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeave = async (organization: Organization) => {
    try {
      setLoadingAction(true);
      await leaveOrganization({
        functionName: "leaveOrganization",
        args: [organization.id],
      });
      alert(`Successfully left ${organization.name}!`);
      setSelectedOrganization(null);
    } catch (error) {
      console.error("Error leaving organization:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Organizations</h1>
      <div className="overflow-x-auto">
        <table className="table w-full border border-gray-200 shadow-lg">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Token</th>
              <th>Admins</th>
              <th>Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org.id.toString()} className="hover">
                <td>{org.id.toString()}</td>
                <td>{org.name}</td>
                <td>{org.token}</td>
                <td>{org.adminCount.toString()}</td>
                <td>{org.userCount.toString()}</td>
                <td>
                  {org.isMember ? (
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        setSelectedOrganization(org);
                        setIsModalOpen(true);
                      }}
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedOrganization(org);
                        setIsModalOpen(true);
                      }}
                    >
                      Join
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrganization && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4 text-center">
            {selectedOrganization.isMember ? "Leave" : "Join"} Organization
          </h2>
          <p className="mb-4 text-center">
            Are you sure you want to {selectedOrganization.isMember ? "leave" : "join"}{" "}
            <strong>{selectedOrganization.name}</strong>?
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={loadingAction}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                selectedOrganization.isMember ? handleLeave(selectedOrganization) : handleJoin(selectedOrganization)
              }
              disabled={loadingAction}
            >
              {loadingAction ? "Processing..." : selectedOrganization.isMember ? "Leave" : "Join"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Organizations;
