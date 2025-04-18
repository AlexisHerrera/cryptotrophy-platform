"use client";

import React from "react";
import { MotionDiv } from "~~/app/motions/use-motion";

const Home: React.FC = () => {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4"> Home </div>
    </MotionDiv>
  );
};

export default Home;
