"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrizePage from "~~/components/common/PrizePage";

const PrizeCenter: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  return <PrizePage organizationId={organizationId} mode="admin" />;
};

export default PrizeCenter;
