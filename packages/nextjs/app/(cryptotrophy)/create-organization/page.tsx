"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CreateOrganizationForm from "~~/app/(cryptotrophy)/create-organization/_components/CreateOrganizationForm";
import { MotionDiv } from "~~/app/motions/use-motion";

const CreateOrganization = (): React.ReactElement => {
  const router = useRouter();
  return (
    <MotionDiv
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4 max-w-3xl">
        <button className="btn btn-secondary absolute left-3" onClick={() => router.push("/")}>
          Back
        </button>
        <CreateOrganizationForm />
      </div>
    </MotionDiv>
  );
};

export default CreateOrganization;
