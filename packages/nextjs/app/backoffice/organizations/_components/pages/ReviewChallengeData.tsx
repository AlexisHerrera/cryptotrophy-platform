import React from "react";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

interface ReviewChallengeDataProps {
  formData: ChallengeData;
}

const ReviewChallengeData: React.FC<ReviewChallengeDataProps> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Review Your Data</h3>

      <div>
        <strong>Description:</strong> {formData.description}
      </div>

      <div>
        <strong>Prize Amount:</strong> {formData.prizeAmount}
      </div>

      <div>
        <strong>Max Winners:</strong> {formData.maxWinners}
      </div>

      <div>
        <strong>Validator UID:</strong> {formData.validatorUID}
      </div>
    </div>
  );
};

export default ReviewChallengeData;
