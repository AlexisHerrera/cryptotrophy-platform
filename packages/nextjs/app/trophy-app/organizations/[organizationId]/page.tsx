"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChallengeGrid } from "../_components/ChallengeGrid";
import { HeroSection } from "../_components/HeroSection";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { loadMetadata } from "~~/utils/loadMetadata";

type OrganizationMetadata = {
  logo?: string;
  name?: string;
  description?: string;
};

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  admins: string[];
  userIsAdmin: boolean;
  baseURI: string;
}

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  const router = useRouter();

  const [metadata, setMetadata] = useState<{ logo?: string; name?: string; description?: string }>({});
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);

  const { data: organizationData, isLoading: isLoadingOrganization } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getOrganizationDetails",
    args: [BigInt(organizationId as string)],
  });

  // Step 1: Setup organization data
  useEffect(() => {
    if (organizationData) {
      // First cast to unknown to avoid readonly array issues, then to specific type
      const orgData = organizationData as unknown as [bigint, string, string, string, string[], boolean, string];

      const [id, name, token, , admins, userIsAdmin, baseURI] = orgData;

      setOrganization({
        id,
        name,
        token,
        admins,
        userIsAdmin,
        baseURI,
      });
    }
  }, [organizationData]);

  // Step 2: Fetch metadata when organization is ready
  useEffect(() => {
    const fetchMetadata = async () => {
      if (organization?.baseURI) {
        try {
          const data = await loadMetadata<OrganizationMetadata>(organization.baseURI, {
            allowImageOnly: true,
            defaultField: "logo",
          });
          setMetadata(data);
        } catch (error) {
          console.error("Error fetching IPFS metadata:", error);
        }
      }
    };

    fetchMetadata();
  }, [organization]);

  if (isLoadingOrganization || !organization) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl p-4">
        {/* Hero Section */}
        <HeroSection
          title={organization.name}
          subtitle={metadata.description || "Welcome to your organization's dashboard!"}
          imageUrl={metadata.logo ? metadata.logo : undefined}
          buttonLabel="Prize Center"
          onButtonClick={() => router.push(`/trophy-app/organizations/${organization.id}/prizes`)}
        />

        {/* Challenges Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Active Challenges</h2>
          <ChallengeGrid orgId={organizationId} />
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
