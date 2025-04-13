"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { decodeBytes32String } from "ethers";
import AdminPanel from "~~/app/trophy-app/organizations/_components/AdminPanel";
import ChallengeList from "~~/app/trophy-app/organizations/_components/ChallengeList";
import CreateChallengeModal from "~~/app/trophy-app/organizations/_components/CreateChallengeModal";
import ManageCustomersModal from "~~/app/trophy-app/organizations/_components/ManageCustomersModal";
import Modal from "~~/components/Modal";
import { BackButton } from "~~/components/common/BackButton";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  admins: string[];
  customerBaseUID: string;
  userIsAdmin: boolean;
  userIsMember: boolean;
}

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams();
  const router = useRouter();

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [showManageCustomersModal, setShowManageCustomersModal] = useState(false);

  const { data: organizationData, isLoading: isLoadingOrganization } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getOrganizationDetails",
    args: [BigInt(organizationId as string)],
  });

  const { data: challengeIds } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "getChallengesByOrg",
    args: [BigInt(organizationId as string)],
  });

  const { writeContractAsync: addAdmin } = useScaffoldWriteContract("OrganizationManager");
  const { writeContractAsync: addCustomer } = useScaffoldWriteContract("OnChainCustomerBase");

  useEffect(() => {
    if (organizationData) {
      const [id, name, token, admins, customerBaseUIDBytes, userIsAdmin, userIsMember] = organizationData as [
        bigint,
        string,
        string,
        string[],
        `0x${string}`,
        boolean,
        boolean,
      ];
      const customerBaseUID = decodeBytes32String(customerBaseUIDBytes);
      setOrganization({
        id,
        name,
        token,
        admins,
        customerBaseUID,
        userIsAdmin: userIsAdmin,
        userIsMember: userIsMember,
      });
    }
  }, [organizationData]);

  if (isLoadingOrganization || !organization) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!organization.userIsAdmin && !organization.userIsMember) {
    return <p>You do not have access to this organization.</p>;
  }

  return (
    <div className="flex justify-between">
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center justify-center">
          <h1 className="text-4xl text-center text-gray-700 font-mono grayscale mb-4 dark:text-gray-300">
            {organization.name}
          </h1>
        </div>

        <div className="text-center">
          <div className="flex justify-center gap-4 mb-4">
            {/*{organization.userIsAdmin && (*/}
            {/*  <div className="flex gap-4">*/}
            {/*    <button className="btn btn-primary" onClick={() => setShowCreateChallengeModal(true)}>*/}
            {/*      Create Challenge*/}
            {/*    </button>*/}
            {/*    <button className="btn btn-secondary" onClick={() => setShowAdminPanelModal(true)}>*/}
            {/*      Open Admin Panel*/}
            {/*    </button>*/}
            {/*  </div>*/}
            {/*)}*/}
            {organization.customerBaseUID == "OnChainCustomerBaseV1" && organization.userIsAdmin && (
              <div className="flex gap-4">
                <button className="btn btn-primary" onClick={() => setShowManageCustomersModal(true)}>
                  Manage Customers
                </button>
              </div>
            )}
            <div>
              <button
                className="btn bg-amber-400 dark:text-gray-800 dark:btn-warning"
                onClick={() => router.push(`/trophy-app/organizations/${organization.id}/prizes`)}
              >
                Prize Center
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
            <ChallengeList challengeIds={challengeIds ?? []} orgId={BigInt(organizationId as string)} />
          </div>
        </div>

        {showCreateChallengeModal && (
          <CreateChallengeModal organizationId={organization.id} onClose={() => setShowCreateChallengeModal(false)} />
        )}

        {showManageCustomersModal && (
          <Modal onClose={() => setShowManageCustomersModal(false)}>
            <ManageCustomersModal organizationId={organization.id} addCustomer={addCustomer} />
          </Modal>
        )}

        {showAdminPanelModal && (
          <Modal onClose={() => setShowAdminPanelModal(false)}>
            <AdminPanel organizationId={organization.id} addAdmin={addAdmin} />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
