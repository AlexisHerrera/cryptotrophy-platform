import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Organization } from "~~/utils/cryptotrophyIndex/types";

// Helper to convert ipfs:// URLs to a public gateway URL.
const convertIpfsUrl = (baseURI: string): string => {
  if (baseURI.startsWith("ipfs://")) {
    return baseURI.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return baseURI;
};

// A card component for displaying an individual organization's data.
// It fetches additional metadata (logo and description) from IPFS.
export const OrganizationCard: React.FC<{ item: Organization }> = ({ item: organization }) => {
  const [metadata, setMetadata] = useState<{ logo?: string; name?: string; description?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchMetadata = async () => {
      if (organization.baseURI) {
        setLoading(true);
        try {
          const metadataUrl = convertIpfsUrl(organization.baseURI) + "/metadata.json";
          const res = await fetch(metadataUrl);
          const data = await res.json();
          setMetadata(data);
        } catch (error) {
          console.error("Error fetching IPFS metadata:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMetadata();
  }, [organization.baseURI]);

  return (
    <div
      onClick={() => router.push(`/trophy-app/organizations/${organization.id.toString()}`)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      {metadata.logo ? (
        <img src={metadata.logo} alt={metadata.name} className="w-full h-60 object-cover rounded-md mb-4" />
      ) : (
        <div className="w-full h-60 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center text-gray-500">
          {loading ? "Loading logo..." : "No logo available"}
        </div>
      )}
      <h2 className="text-xl font-semibold dark:text-white">{metadata.name}</h2>
      {metadata.description && <p className="text-gray-800 dark:text-gray-200 mt-2">{metadata.description}</p>}
      <p className="text-gray-600 dark:text-gray-300">ID: {organization.id}</p>
    </div>
  );
};
