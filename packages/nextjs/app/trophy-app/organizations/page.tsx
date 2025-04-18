"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MotionDiv } from "~~/app/motions/use-motion";
import OrganizationTable from "~~/app/trophy-app/organizations/_components/OrganizationTable";
import { BackButton } from "~~/components/common/BackButton";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Organizations: React.FC = () => {
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
              router.push("/trophy-app");
            }}
          >
            Go back
          </button>
        </div>
      ) : (
        <div className="flex justify-between">
          <BackButton />
          <OrganizationTable organizationsData={organizationsData} baseUrl={"trophy-app"} />
        </div>
      )}
    </MotionDiv>
  );
};

export default Organizations;
