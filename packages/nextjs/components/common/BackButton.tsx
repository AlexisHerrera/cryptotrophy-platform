"use client";

import React from "react";
import { useRouter } from "next/navigation";

export const BackButton = () => {
  const router = useRouter();
  return (
    <button className="btn btn-secondary" onClick={() => router.back()}>
      Back
    </button>
  );
};
