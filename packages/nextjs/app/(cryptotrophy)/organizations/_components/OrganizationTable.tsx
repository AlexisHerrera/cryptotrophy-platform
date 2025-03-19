import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CopyButton from "~~/app/(cryptotrophy)/organizations/_components/CopyButton";
import ModalLeaveJoin from "~~/app/(cryptotrophy)/organizations/_components/ModalLeaveJoin";
import UserBalance from "~~/app/(cryptotrophy)/organizations/_components/UserBalance";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
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

interface IOrganizationTable {
  organizationsData: readonly [
    readonly bigint[],
    readonly string[],
    readonly string[],
    readonly string[],
    readonly bigint[],
    readonly bigint[],
    readonly boolean[],
  ];
}

const OrganizationTable = ({ organizationsData }: IOrganizationTable): React.ReactElement => {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Funciones para unirse o salir
  const { writeContractAsync: joinOrganization } = useScaffoldWriteContract("OrganizationManager");
  const { writeContractAsync: leaveOrganization } = useScaffoldWriteContract("OrganizationManager");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

  const [orgIds, names, tokenSymbols, tokenAddresses, adminCounts, userCounts, isMembers] = organizationsData;

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
      //notification.success(`Successfully joined ${organization.name}!`);
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
      //notification.success(`Successfully left ${organization.name}!`);
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
    <div className="p-4">
      <div className="container mx-auto p-4 max-w-4xl">
        <table className="table table-zebra border border-gray-200 shadow-lg">
          <thead>
            <tr>
              <th>Name</th>
              <th>Token Info</th>
              <th>Your Balance</th>
              <th>Admins</th>
              <th>Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrganizations.map(org => (
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
                <td>
                  <UserBalance orgId={org.id} />
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
        onAccept={async () => {
          if (selectedOrganization === null) return;
          if (selectedOrganization?.isMember) {
            await handleLeave(selectedOrganization);
          } else {
            await handleJoin(selectedOrganization);
          }
          setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default OrganizationTable;
