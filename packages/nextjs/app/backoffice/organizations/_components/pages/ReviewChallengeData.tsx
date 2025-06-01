import React from "react";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface ReviewChallengeDataProps {
  formData: ChallengeData;
}

const ReviewChallengeData: React.FC<ReviewChallengeDataProps> = ({ formData }) => {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 space-y-6 font-sans max-w-xl mx-auto">
      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
            Description
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100">{formData.description}</div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
            Prize Amount
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100">{formData.prizeAmount}</div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
            Max Winners
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100">{formData.maxWinners}</div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
            Validator UID
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100">{formData.validatorUID}</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewChallengeData;
