"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminPanel from "~~/app/(cryptotrophy)/organizations/_components/AdminPanel";
import ChallengeList from "~~/app/(cryptotrophy)/organizations/_components/ChallengeList";
import CreateChallengeModal from "~~/app/(cryptotrophy)/organizations/_components/CreateChallengeModal";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  admins: string[];
  users: string[];
  userIsAdmin: boolean;
  userIsMember: boolean;
}

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams();
  const router = useRouter();

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);

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
  const { writeContractAsync: addUser } = useScaffoldWriteContract("OrganizationManager");

  useEffect(() => {
    if (organizationData) {
      const [id, name, token, admins, users, userIsAdmin, userIsMember] = organizationData as [
        bigint,
        string,
        string,
        string[],
        string[],
        boolean,
        boolean,
      ];

      setOrganization({
        id,
        name,
        token,
        admins,
        users,
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
    <div className="p-4">
      <div className="relative flex items-center justify-center">
        <button className="btn btn-secondary absolute left-0" onClick={() => router.push("/organizations")}>
          Back
        </button>
        <h1 className="text-4xl text-center text-gray-700 font-mono grayscale mb-4 dark:text-gray-300">
          {organization.name}
        </h1>
      </div>

      <div className="text-center">
        <div className="flex justify-center gap-4 mb-4">
          {organization.userIsAdmin && (
            <div className="flex gap-4">
              <button className="btn btn-primary" onClick={() => setShowCreateChallengeModal(true)}>
                Create Challenge
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAdminPanelModal(true)}>
                Open Admin Panel
              </button>
            </div>
          )}
          <div>
            <button
              className="btn bg-amber-400 dark:text-gray-800 dark:btn-warning"
              onClick={() => router.push(`/organizations/${organization.id}/prizes`)}
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

      {showAdminPanelModal && (
        <Modal onClose={() => setShowAdminPanelModal(false)}>
          <AdminPanel organizationId={organization.id} addAdmin={addAdmin} addUser={addUser} />
        </Modal>
      )}
    </div>
  );
};

export default OrganizationPage;
