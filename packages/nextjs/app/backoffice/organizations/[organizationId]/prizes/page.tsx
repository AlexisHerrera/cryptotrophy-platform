"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrizePage from "~~/app/backoffice/organizations/_components/PrizePage";

const PrizeCenter: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  return <PrizePage organizationId={organizationId} mode="admin" />;
};

export default PrizeCenter;
