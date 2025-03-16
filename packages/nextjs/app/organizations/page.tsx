"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MotionDiv } from "~~/app/motions/use-motion";
import OrganizationTable from "~~/app/organizations/_components/OrganizationTable";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Organizations: React.FC = () => {
  // Leer organizaciones desde el contrato
  const { data: organizationsData, isLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "listOrganizationsWithDetails",
  });
  const router = useRouter();

  if (isLoading || !organizationsData) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
    >
      {organizationsData[0]?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">There are no organizations available!</h2>
          <p className="text-xl text-gray-600">You can&#39;t join any organization at the moment.</p>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
            onClick={() => {
              router.push("/");
            }}
          >
            Go back
          </button>
        </div>
      ) : (
        <div className="p-4 relative">
          <button className="btn btn-secondary absolute left-3 top-3" onClick={() => router.push("/")}>
            Back
          </button>
          <button className="btn bg-green-300 absolute right-32 top-3" onClick={() => router.push("/market")}>
            Go to Market
          </button>
          <OrganizationTable organizationsData={organizationsData} />
        </div>
      )}
    </MotionDiv>
  );
};

export default Organizations;
