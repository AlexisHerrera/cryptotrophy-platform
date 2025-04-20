"use client";

import React from "react";
import { OrganizationsGrid } from "~~/app/(trophyapp)/_components/OrganizationsGrid";
import { MotionDiv } from "~~/app/motions/use-motion";

const Home: React.FC = () => {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
    >
      <OrganizationsGrid />
    </MotionDiv>
  );
};

export default Home;
