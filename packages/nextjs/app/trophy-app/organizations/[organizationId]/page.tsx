"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChallengeGrid } from "../_components/ChallengeGrid";
import { HeroSection } from "../_components/HeroSection";
import { MotionDiv } from "~~/app/motions/use-motion";
import { useOrganizationWithFallback } from "~~/hooks/trophy-app/useOrganizationWithFallback";
import { loadMetadata } from "~~/utils/loadMetadata";

type OrganizationMetadata = {
  logo?: string;
  name?: string;
  description?: string;
};

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  const router = useRouter();

  const [metadata, setMetadata] = useState<{ logo?: string; name?: string; description?: string; legalUrl?: string }>(
    {},
  );

  const { organization, isLoading, error, source } = useOrganizationWithFallback(organizationId);

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
  }, [organization?.baseURI]);

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <div className="alert alert-error shadow-lg my-6">
        <span>Error loading organization: {message}</span>
      </div>
    );
  }

  if (isLoading || !organization) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl p-2">
          {/* Hero Section */}
          <HeroSection
            title={organization.name}
            subtitle={metadata.description || "Welcome to your organization's dashboard!"}
            imageUrl={metadata.logo ? metadata.logo : undefined}
            buttonLabel="Prize Center"
            onButtonClick={() => router.push(`/trophy-app/organizations/${organization.id}/prizes`)}
          />
        </div>
      </div>
      <MotionDiv
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.2 }}
        className="mt-2"
      >
        <ChallengeGrid orgId={organizationId} />
      </MotionDiv>

      {/* Legal section */}
      <div className="w-full flex justify-center mt-8 px-2">
        {metadata.legalUrl ? (
          <Link href={metadata.legalUrl} target="_blank" rel="noopener" className="text-sm link link-primary">
            View policy &amp; legal conditions
          </Link>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-lg">
            No legal conditions linked here. Please check the organization’s home page.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
