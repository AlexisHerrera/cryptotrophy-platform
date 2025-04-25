"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "~~/components/common/BackButton";
import ChallengeList from "~~/components/common/ChallengeList";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  admins: string[];
  userIsAdmin: boolean;
}

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams();
  const router = useRouter();

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);

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

  useEffect(() => {
    if (organizationData) {
      const [id, name, token, admins, userIsAdmin] = organizationData as [
        bigint, // id
        string, // name
        string, // token
        string[], // admins
        boolean, // userIsAdmin
      ];
      setOrganization({
        id,
        name,
        token,
        admins,
        userIsAdmin: userIsAdmin,
      });
    }
  }, [organizationData]);

  if (isLoadingOrganization || !organization) {
    return <span className="loading loading-spinner loading-lg"></span>;
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
            <ChallengeList mode={"user"} challengeIds={challengeIds ?? []} orgId={BigInt(organizationId as string)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
