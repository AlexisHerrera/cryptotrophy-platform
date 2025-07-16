import React, { useState } from "react";
import clsx from "clsx";
import { formatUnits } from "ethers";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
import { ClaimChallengeButton } from "~~/app/trophy-app/organizations/_components/ClaimChallengeButton";
import { Challenge } from "~~/utils/cryptotrophyIndex/types";

export const ChallengeCard: React.FC<{ item: Challenge; claimed: boolean | undefined }> = ({
  item: challenge,
  claimed,
}) => {
  const [showFull, setShowFull] = useState(false);
  const { isConnected } = useAccount();

  const formattedPrize = formatUnits(BigInt(challenge.prizeAmount), 18);
  const fullDate = new Date(Number(challenge.startTime) * 1000);
  const endDateFull = new Date(Number(challenge.endTime) * 1000);

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const startDate = dateFormatter.format(fullDate);
  const startTime = timeFormatter.format(fullDate);
  const endDate = dateFormatter.format(endDateFull);
  const endTime = timeFormatter.format(endDateFull);

  const currentDate = new Date();
  const isActive = challenge.isActive && fullDate < currentDate && endDateFull > currentDate;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between h-full group">
      {/* Top Section */}
      <div>
        {/* Status Label */}
        <div className="flex justify-between items-center mb-2">
          <span
            className={clsx(
              "px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full",
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            )}
          >
            {isActive ? "Active" : "Closed"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex flex-col items-center leading-tight">
          <span className="text-l font-normal text-gray-600 dark:text-gray-300 mt-1">Challenge #{challenge.id}</span>
        </h3>

        {/* Description */}
        <div
          className="relative h-32 overflow-hidden rounded-md group/desc cursor-pointer mb-4"
          onClick={() => setShowFull(true)}
        >
          {/* ▼ 1 · Clamped preview */}
          <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-5 pointer-events-none">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>

          {/* ▼ 2 · Hover call-out */}
          <div
            className="
                absolute inset-0 flex items-center justify-center
                bg-black/60 text-white text-xs font-medium
                opacity-0 transition-opacity duration-150 ease-out
                pointer-events-none   /* let clicks reach wrapper */
                group-hover/desc:opacity-100"
          >
            Click to see full description
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 space-y-2 text-sm mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Loot</span>
            <span className="text-gray-600 dark:text-gray-400">{formattedPrize} tokens</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Max Winners</span>
            <span className="text-gray-600 dark:text-gray-400">{challenge.maxWinners}</span>
          </div>
        </div>

        {/* Duration Timeline */}
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-md p-2 text-gray-700 dark:text-gray-300 text-xs gap-4">
          {/* Start */}
          <div className="flex flex-col items-center">
            <span className="w-2 h-2 rounded-full bg-success mb-1" />
            <span className="uppercase text-[10px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">
              Start
            </span>
            <span className="text-xs font-semibold">{startDate}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{startTime}</span>
          </div>
          {/* Timeline bar */}
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-500 mx-2" />
          {/* End */}
          <div className="flex flex-col items-center">
            <span className="w-2 h-2 rounded-full bg-error mb-1" />
            <span className="uppercase text-[10px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">
              End
            </span>
            <span className="text-xs font-semibold">{endDate}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{endTime}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section (Button) */}
      <div className="mt-6 flex justify-center">
        {isActive ? (
          isConnected ? (
            !claimed ? (
              <ClaimChallengeButton
                orgId={BigInt(challenge.orgId)}
                challengeId={BigInt(challenge.id)}
                validatorUID={challenge.validatorUID}
              />
            ) : (
              <span className="text-gray-400 italic text-center block">Claimed</span>
            )
          ) : (
            <span className="text-gray-400 italic text-center block">Connect your wallet to claim</span>
          )
        ) : (
          <span className="text-gray-400 italic text-center block">Closed</span>
        )}
      </div>

      {/* ──────────── FULL DESCRIPTION MODAL (portal-style) ──────────── */}
      {showFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFull(false)} />

          {/* Modal panel */}
          <div
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg
                       w-[90%] max-w-xl max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()} /* prevent backdrop close */
          >
            {/* Close button */}
            <button
              onClick={() => setShowFull(false)}
              aria-label="Close"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600
                         dark:hover:text-gray-300 text-2xl leading-none"
            >
              &times;
            </button>

            <h4 className="text-lg font-semibold mb-4">Challenge&nbsp;#{challenge.id}</h4>

            <div className="prose dark:prose-invert prose-sm">
              <ReactMarkdown>{challenge.description}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
