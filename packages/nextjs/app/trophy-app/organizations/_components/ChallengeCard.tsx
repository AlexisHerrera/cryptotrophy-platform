import React from "react";
import { formatUnits } from "ethers";
import ReactMarkdown from "react-markdown";
import { ClaimChallengeButton } from "~~/app/trophy-app/organizations/_components/ClaimChallengeButton";
import { Challenge } from "~~/utils/cryptotrophyIndex/types";

export const ChallengeCard: React.FC<{ item: Challenge }> = ({ item: challenge }) => {
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between h-full group">
      {/* Top Section */}
      <div>
        {/* Status Label */}
        <div className="flex justify-between items-center mb-2">
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${
              challenge.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {challenge.isActive ? "Active" : "Closed"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex flex-col items-center leading-tight">
          Challenge
          <span className="text-l font-normal text-gray-600 dark:text-gray-300 mt-1">#{challenge.id}</span>
        </h3>

        {/* Description */}
        <div className="relative mb-4 max-h-32 overflow-hidden group-hover:max-h-none">
          {/* Normal text */}
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>

          {/* On hover, full text absolutely positioned */}
          <div className="absolute inset-0 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md hidden group-hover:flex flex-col justify-center z-10">
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <ReactMarkdown>{challenge.description}</ReactMarkdown>
            </div>
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
        {challenge.isActive ? (
          <ClaimChallengeButton
            orgId={BigInt(challenge.orgId)}
            challengeId={BigInt(challenge.id)}
            validatorUID={challenge.validatorUID}
          />
        ) : (
          <span className="text-gray-400 italic text-center block">Closed</span>
        )}
      </div>
    </div>
  );
};
