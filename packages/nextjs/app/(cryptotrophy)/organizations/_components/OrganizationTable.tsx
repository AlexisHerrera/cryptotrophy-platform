import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "~~/app/(cryptotrophy)/organizations/_components/AdminPanel";
import CopyButton from "~~/app/(cryptotrophy)/organizations/_components/CopyButton";
import UserBalance from "~~/app/(cryptotrophy)/organizations/_components/UserBalance";
import Modal from "~~/components/Modal";
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
  const { writeContractAsync: addAdmin } = useScaffoldWriteContract("OrganizationManager");
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
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
                  {org.isMember && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedOrganization(org);
                        setShowAdminPanelModal(true);
                      }}
                    >
                      Admin
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

      {showAdminPanelModal && selectedOrganization !== null && (
        <Modal onClose={() => setShowAdminPanelModal(false)}>
          <AdminPanel organizationId={selectedOrganization.id} addAdmin={addAdmin} />
        </Modal>
      )}
    </div>
  );
};

export default OrganizationTable;
