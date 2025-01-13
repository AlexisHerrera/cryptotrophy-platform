"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MotionDiv } from "~~/app/motions/use-motion";
import CopyButton from "~~/app/organizations/_components/CopyButton";
import ModalLeaveJoin from "~~/app/organizations/_components/ModalLeaveJoin";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

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

  const handleCopy = () => {
    notification.success("Token address copied!");
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4">
        <div className="container mx-auto p-4 max-w-4xl">
          <table className="table table-zebra border border-gray-200 shadow-lg">
            <thead>
              <tr>
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
                  <td
                    className="cursor-pointer font-bold"
                    onClick={() => router.push(`/organizations/${org.id.toString()}`)}
                  >
                    {org.name}
                  </td>
                  <td className="flex items-center">
                    {org.tokenSymbols}
                    <CopyButton address={org.tokenAddress} onCopy={handleCopy} />
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
        <ModalLeaveJoin
          title={selectedOrganization?.isMember ? "Leave Organization" : "Join Organization"}
          message={`Are you sure you want to ${selectedOrganization?.isMember ? "leave" : "join"} ${
            selectedOrganization?.name
          }?`}
          isOpen={isModalOpen}
          isLoading={loadingAction}
          onAccept={() => {
            if (selectedOrganization?.isMember) {
              void handleLeave(selectedOrganization);
            }
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </div>
    </MotionDiv>
  );
};

export default Organizations;
