import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Organization } from "~~/utils/cryptotrophyIndex/types";
import { loadMetadata } from "~~/utils/loadMetadata";

type OrganizationMetadata = {
  logo?: string;
  name?: string;
  description?: string;
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
          const data = await loadMetadata<OrganizationMetadata>(organization.baseURI, {
            allowImageOnly: true,
            defaultField: "logo",
          });
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
        <div className="w-full aspect-[4/3] relative mb-4">
          <img
            src={metadata.logo}
            alt={organization.name}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {loading ? "Loading logo..." : "No logo available"}
        </div>
      )}
      <h2 className="text-xl font-semibold dark:text-white">{organization.name}</h2>
      {metadata.description && <p className="text-gray-800 dark:text-gray-200 mt-2">{metadata.description}</p>}
      <p className="text-gray-600 dark:text-gray-300">ID: {organization.id}</p>
    </div>
  );
};
