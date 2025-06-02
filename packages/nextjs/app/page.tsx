"use client";

import type { NextPage } from "next";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { MotionDiv } from "~~/app/motions/use-motion";
import { Footer } from "~~/components/home/Footer";
import { Header } from "~~/components/home/Header";
import { HeroSection } from "~~/components/home/HeroSection";
import { OrganizationsInfo } from "~~/components/home/OrganizationsInfo";
import { ParticipantFeatures } from "~~/components/home/ParticipantFeatures";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <Header />
        <HeroSection />
        <ParticipantFeatures />

        <section className="w-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <OrganizationsInfo />
          </div>
        </section>
        <Footer connectedAddress={connectedAddress} />
      </div>
    </MotionDiv>
  );
};

export default Home;
