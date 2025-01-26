"use client";

import { useParams } from "next/navigation";

const PrizeCenter = () => {
  const { organizationId } = useParams();
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className={"text-4xl text-gray-700 font-mono grayscale mb-4 dark:text-gray-300 text-center"}>Prize Center</h1>
    </div>
  );
};

export default PrizeCenter;
