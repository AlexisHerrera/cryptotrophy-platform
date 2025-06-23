"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "~~/hooks/cryptotrophyIndex/useOrganization";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface OrganizationDetails {
  id: bigint;
  name: string;
  token: string;
  admins: string[];
  userIsAdmin: boolean;
  baseURI: string;
}

export interface UseOrganizationWithFallbackResult {
  organization: OrganizationDetails | null;
  isLoading: boolean;
  error: unknown;
  source: "index" | "chain" | null;
}

export const useOrganizationWithFallback = (
  organizationId: string,
  fallbackDelay = 10_000,
): UseOrganizationWithFallbackResult => {
  /* ───────── Local state ───────── */
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [source, setSource] = useState<"index" | "chain" | null>(null);
  const [shouldFallback, setShouldFallback] = useState(false);

  /* ───────── 1. Indexer query ───────── */
  const { data: indexRes, isLoading: indexLoading, error: indexError } = useOrganization(organizationId);

  /* ───────── 2. Decide when to fall back ───────── */
  useEffect(() => {
    // Success: exactly one org → use it and cancel fallback
    if (indexRes?.organizations.totalCount === 1) {
      const item = indexRes.organizations.items[0];
      setOrganization({
        id: BigInt(item.id),
        name: item.name,
        token: item.token,
        admins: [], // populate if your index supplies this
        userIsAdmin: false,
        baseURI: item.baseURI,
      });
      setSource("index");
      setShouldFallback(false);
      return; // stop here, no timer
    }

    // Fail fast: error or zero results → go on-chain immediately
    if (indexError || indexRes?.organizations.totalCount === 0) {
      setShouldFallback(true);
      return;
    }

    // Still loading → start countdown
    const t = setTimeout(() => setShouldFallback(true), fallbackDelay);
    return () => clearTimeout(t);
  }, [indexRes, indexError, fallbackDelay]);

  /* ───────── 3. On-chain fallback ───────── */
  const {
    data: chainData,
    isLoading: chainLoading,
    error: chainError,
  } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getOrganizationDetails",
    args: [BigInt(organizationId)],
    query: { enabled: shouldFallback },
  });

  // Normalise the chain response when it arrives
  useEffect(() => {
    if (!chainData) return;

    const [id, name, token, , admins, userIsAdmin, baseURI] = chainData as unknown as [
      bigint,
      string,
      string,
      string,
      string[],
      boolean,
      string,
    ];

    setOrganization({ id, name, token, admins, userIsAdmin, baseURI });
    setSource("chain");
  }, [chainData]);

  /* ───────── 4. Derived flags ───────── */
  const isLoading = !organization && (indexLoading || (shouldFallback && chainLoading));

  const error = indexError ?? chainError ?? null;

  return { organization, isLoading, error, source };
};
