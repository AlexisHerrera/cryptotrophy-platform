"use client";

import { useParams } from "next/navigation";

const PrizeCenter = () => {
  const { organizationId } = useParams();
  return <div>Prize Center of {organizationId}</div>;
};

export default PrizeCenter;
