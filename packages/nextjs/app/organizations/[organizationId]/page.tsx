"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminPanel from "~~/app/organizations/_components/AdminPanel";
import ChallengeList from "~~/app/organizations/_components/ChallengeList";
import CreateChallengeModal from "~~/app/organizations/_components/CreateChallengeModal";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  admins: string[];
  users: string[];
  challengeIds: bigint[];
  isAdmin: boolean;
  isUser: boolean;
}

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams();
  const router = useRouter();

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);

  const { data: organizationData, isLoading: isLoadingOrganization } = useScaffoldReadContract({
    contractName: "CryptoTrophyPlatform",
    functionName: "getOrganizationDetails",
    args: [BigInt(organizationId as string)],
  });

  const { writeContractAsync: createChallenge } = useScaffoldWriteContract("CryptoTrophyPlatform");
  const { writeContractAsync: addAdmin } = useScaffoldWriteContract("CryptoTrophyPlatform");
  const { writeContractAsync: addUser } = useScaffoldWriteContract("CryptoTrophyPlatform");

  useEffect(() => {
    if (organizationData) {
      const [id, name, token, admins, users, challengeIds, isAdmin, isUser] = organizationData as [
        bigint,
        string,
        string,
        string[],
        string[],
        bigint[],
        boolean,
        boolean,
      ];

      setOrganization({
        id,
        name,
        token,
        admins,
        users,
        challengeIds,
        isAdmin,
        isUser,
      });
    }
  }, [organizationData]);

  if (isLoadingOrganization || !organization) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!organization.isAdmin && !organization.isUser) {
    return <p>You do not have access to this organization.</p>;
  }

  return (
    <div className="p-4">
      <button className="btn btn-secondary mb-4" onClick={() => router.back()}>
        Back
      </button>

      <div className="text-center">
        <h1 className="text-4xl text-gray-700 font-mono grayscale mb-4">{organization.name}</h1>

        {organization.isAdmin && (
          <div className="flex justify-center gap-4 mb-4">
            <button className="btn btn-primary" onClick={() => setShowCreateChallengeModal(true)}>
              Create Challenge
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAdminPanelModal(true)}>
              Open Admin Panel
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
          <ChallengeList challengeIds={organization.challengeIds} orgId={BigInt(organizationId as string)} />
        </div>
      </div>

      {showCreateChallengeModal && (
        <CreateChallengeModal
          organizationId={organization.id}
          onClose={() => setShowCreateChallengeModal(false)}
          createChallenge={createChallenge}
        />
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
