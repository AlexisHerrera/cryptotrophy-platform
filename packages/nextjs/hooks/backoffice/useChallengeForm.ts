import { useCallback, useEffect, useState } from "react";
import { ChallengeData } from "~~/utils/challenges/challengeParam";

const getInitialChallengeData = (organizationId: bigint): ChallengeData => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultStartTime = now.toISOString().slice(0, 16);

  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultEndTime = oneWeekLater.toISOString().slice(0, 16);

  return {
    organizationId: organizationId,
    description: "",
    prizeAmount: 0,
    maxPrizeAmount: 0n,
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    maxWinners: 1,
    selectedValidator: "",
    params: {},
  };
};

export const useChallengeForm = (initialOrganizationId: bigint | undefined) => {
  const [challengeForm, setChallengeForm] = useState<ChallengeData>(() =>
    initialOrganizationId !== undefined ? getInitialChallengeData(initialOrganizationId) : ({} as ChallengeData),
  );

  const handleInputChange = useCallback(
    (field: keyof ChallengeData, value: string | number | bigint | Record<string, any>) => {
      if (field === "prizeAmount") {
        const numValue = value === "" ? 0 : Number(value);
        if (!isNaN(numValue)) {
          setChallengeForm(prev => ({ ...prev, [field]: numValue }));
        }
      } else if (field === "maxWinners") {
        const numValue = value === "" ? 0 : Number(value);
        if (!isNaN(numValue) && Number.isInteger(numValue) && numValue >= 0) {
          setChallengeForm(prev => ({ ...prev, [field]: numValue }));
        }
      } else {
        setChallengeForm(prev => ({ ...prev, [field]: value }));
      }
    },
    [],
  );

  const resetChallengeForm = useCallback((orgId: bigint) => {
    setChallengeForm(getInitialChallengeData(orgId));
  }, []);

  useEffect(() => {
    if (initialOrganizationId !== undefined) {
      if (challengeForm.organizationId !== initialOrganizationId) {
        console.log(`Organization ID changed to ${initialOrganizationId}. Resetting form.`);
        setChallengeForm(getInitialChallengeData(initialOrganizationId));
      }
    } else {
      setChallengeForm({} as ChallengeData);
    }
  }, [challengeForm.organizationId, initialOrganizationId]);

  return {
    challengeForm,
    handleInputChange,
    resetChallengeForm,
    setChallengeForm,
  };
};
