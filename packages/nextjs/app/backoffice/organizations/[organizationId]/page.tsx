"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatUnits } from "ethers";
import {
  BanknotesIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  CubeTransparentIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import AdminPanel from "~~/app/backoffice/organizations/_components/AdminPanel";
import CreateChallengeModal from "~~/app/backoffice/organizations/_components/CreateChallengeModal";
import FundTokenModal from "~~/app/backoffice/organizations/_components/FundTokenModal";
import Modal from "~~/components/Modal";
import ChallengeList from "~~/components/common/ChallengeList";
import { useChallengeForm } from "~~/hooks/backoffice/useChallengeForm";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  tokenSymbol: string;
  admins: string[];
  userIsAdmin: boolean;
  baseURI: string;
}

type Params = {
  organizationId: string;
};

const OrganizationPage: React.FC = () => {
  const { organizationId } = useParams() as Params;
  const router = useRouter();
  const orgIdBigInt = useMemo(() => BigInt(organizationId as string), [organizationId]);
  const challengeFormHook = useChallengeForm(orgIdBigInt);

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [showFundTokenModal, setShowFundTokenModal] = useState(false);

  const { data: organizationData, isLoading: isLoadingOrganization } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getOrganizationDetails",
    args: [orgIdBigInt],
  });

  const { data: challengeIds, refetch: refetchChallengeIds } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "getChallengesByOrg",
    args: [orgIdBigInt],
  });

  const {
    data: availableTokens,
    isLoading: isLoadingTokens,
    refetch: refetchAvailableTokens,
  } = useScaffoldReadContract({
    contractName: "ChallengeManager",
    functionName: "tokensAvailable",
    args: [orgIdBigInt],
  });

  const { writeContractAsync: addAdmin } = useScaffoldWriteContract("OrganizationManager");

  useEffect(() => {
    if (organizationData) {
      const orgData = organizationData as unknown as [bigint, string, string, string, string[], boolean, string];
      const [id, name, token, tokenSymbol, admins, userIsAdmin, baseURI] = orgData;
      setOrganization({ id, name, token, tokenSymbol, admins, userIsAdmin, baseURI });
    }
  }, [organizationData]);

  useEffect(() => {
    if (!showCreateChallengeModal) {
      void refetchChallengeIds();
    }
  }, [showCreateChallengeModal, refetchChallengeIds]);

  if (isLoadingOrganization || !organization) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const formattedAvailableTokens =
    availableTokens !== undefined
      ? parseFloat(formatUnits(availableTokens as bigint, DECIMALS_TOKEN)).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : "Loading...";

  const displayTokenSymbol = organization.tokenSymbol ?? "Token";

  const handleFundSuccess = () => {
    void refetchAvailableTokens();
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text-primary-content flex items-center justify-center gap-3">
          <BuildingOffice2Icon className="h-10 w-10" />
          {organization.name}
        </h1>
        {organization.userIsAdmin && (
          <p className="text-sm text-accent dark:text-accent-content mt-1">You are an admin of this organization.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card bg-base-200 dark:bg-base-300 shadow-lg">
          <div className="card-body items-center text-center">
            <CubeTransparentIcon className="h-12 w-12 text-secondary mb-2" />
            <h2 className="card-title text-neutral-content dark:text-base-content">Token Symbol</h2>
            <p className="text-3xl font-semibold text-secondary dark:text-secondary-content">{displayTokenSymbol}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
              Contract:{" "}
              <a
                href={getBlockExplorerTxLink(organization.id as unknown as number, organization.token)}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover"
              >
                {organization.token}
              </a>
            </p>
          </div>
        </div>

        <div className="card bg-base-200 dark:bg-base-300 shadow-lg">
          <div className="card-body items-center text-center">
            <BanknotesIcon className="h-12 w-12 text-success mb-2" />
            <h2 className="card-title text-neutral-content dark:text-base-content">Tokens Disponibles</h2>
            <p className="text-3xl font-semibold text-success dark:text-success-content">
              {isLoadingTokens ? <span className="loading loading-dots loading-sm"></span> : formattedAvailableTokens}
            </p>
            {organization.userIsAdmin && (
              <button className="btn btn-sm btn-outline btn-success mt-3" onClick={() => setShowFundTokenModal(true)}>
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Fund Tokens
              </button>
            )}
          </div>
        </div>
        <div className="card bg-base-200 dark:bg-base-300 shadow-lg">
          <div className="card-body items-center text-center">
            <UserGroupIcon className="h-12 w-12 text-info mb-2" />
            <h2 className="card-title text-neutral-content dark:text-base-content">Administrators</h2>
            <p className="text-3xl font-semibold text-info dark:text-info-content">{organization.admins.length}</p>
            <div className="tooltip tooltip-bottom" data-tip={organization.admins.join(", ")}>
              <button className="btn btn-xs btn-ghost mt-1">View Admins</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10 p-6 bg-base-100 dark:bg-base-200 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-focus dark:text-base-content">Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {organization.userIsAdmin && (
            <>
              <button className="btn btn-primary btn-wide group" onClick={() => setShowCreateChallengeModal(true)}>
                <SparklesIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                Create Challenge
              </button>
              <button className="btn btn-secondary btn-wide group" onClick={() => setShowAdminPanelModal(true)}>
                <Cog6ToothIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-45" />
                Admin Panel
              </button>
            </>
          )}
          <button
            className="btn btn-accent btn-wide group text-accent-content"
            onClick={() => router.push(`/backoffice/organizations/${organization.id}/prizes`)}
          >
            <TrophyIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
            Prize Center
          </button>
        </div>
      </div>

      <div className="bg-base-100 dark:bg-base-200 p-4 md:p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-neutral-focus dark:text-base-content">Active Challenges</h2>
        {challengeIds && challengeIds.length > 0 ? (
          <ChallengeList mode={"admin"} challengeIds={challengeIds} orgId={orgIdBigInt} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No active challenges for this organization yet.</p>
            {organization.userIsAdmin && (
              <button className="btn btn-primary mt-4" onClick={() => setShowCreateChallengeModal(true)}>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Create First Challenge
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateChallengeModal && (
        <CreateChallengeModal
          challengeFormHook={challengeFormHook}
          organizationId={organization.id}
          onClose={() => setShowCreateChallengeModal(false)}
        />
      )}

      {showAdminPanelModal && (
        <Modal onClose={() => setShowAdminPanelModal(false)}>
          <AdminPanel organizationId={organization.id} addAdmin={addAdmin} />
        </Modal>
      )}

      {showFundTokenModal && organization && (
        <FundTokenModal
          organizationId={organization.id}
          organizationName={organization.name}
          currentTokenSymbol={displayTokenSymbol}
          onClose={() => setShowFundTokenModal(false)}
          onFundSuccess={handleFundSuccess}
        />
      )}
    </div>
  );
};

export default OrganizationPage;
