"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MotionDiv } from "~~/app/motions/use-motion";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Organization {
  id: bigint;
  name: string;
  tokenSymbols: string;
  tokenAddress: string;
  adminCount: bigint;
  userCount: bigint;
  isMember: boolean;
}

const Organizations: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

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

  const [orgIds, names, tokenSymbols, tokenAddresses, adminCounts, userCounts, isMembers] = organizationsData as [
    readonly bigint[],
    readonly string[],
    readonly string[],
    readonly string[],
    readonly bigint[],
    readonly bigint[],
    readonly boolean[],
  ];

  const organizations: Organization[] = orgIds.map((id, index) => ({
    id,
    name: names[index],
    tokenSymbols: tokenSymbols[index],
    tokenAddress: tokenAddresses[index],
    adminCount: adminCounts[index],
    userCount: userCounts[index],
    isMember: isMembers[index],
  }));

  // Calcular el total de páginas
  const totalPages = Math.ceil(organizations.length / itemsPerPage);

  // Obtener los elementos de la página actual
  const paginatedOrganizations = organizations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const copyToClipboard = (address: string, index: number) => {
    void navigator.clipboard.writeText(address);
    setCopiedIndex(index);

    // Cambiar el estado "Copied" temporalmente
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  // MotionDiv va desde la izquierda hacia el centro
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Organizations</h1>
        <div className="overflow-x-auto">
          <table className="table w-full border border-gray-200 shadow-lg">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Token Info</th>
                <th>Admins</th>
                <th>Users</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrganizations.map((org, index) => (
                <tr key={org.id.toString()} className="hover">
                  <td>{org.id.toString()}</td>
                  <td
                    className="cursor-pointer text-blue-500 underline"
                    onClick={() => router.push(`/organizations/${org.id.toString()}`)}
                  >
                    {org.name}
                  </td>
                  <td>
                    {org.tokenSymbols}{" "}
                    <button
                      className={`btn btn-sm ${copiedIndex === index ? "btn-success" : "btn-secondary"} ml-2`}
                      onClick={() => copyToClipboard(org.tokenAddress, index)}
                    >
                      {copiedIndex === index ? (
                        <>
                          Copied <span>✔️</span>
                        </>
                      ) : (
                        "Copy Address"
                      )}
                    </button>
                  </td>
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
        <div className="flex justify-center items-center mt-4">
          <button
            className="btn btn-secondary mr-2"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary ml-2"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
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
    </MotionDiv>
  );
};

export default Organizations;
