import React, { useEffect, useState } from "react";
import Modal from "~~/components/Modal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface CreateChallengeModalProps {
  organizationId: bigint;
  onClose: () => void;
  createChallenge: any;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ organizationId, onClose, createChallenge }) => {
  const [formData, setFormData] = useState({
    description: "",
    prizeAmount: "",
    startTime: "",
    endTime: "",
    maxWinners: "1",
  });

  const [maxPrizeAmount, setMaxPrizeAmount] = useState<bigint>(BigInt(0));

  // Hook para obtener tokens disponibles
  const { data: availableTokens } = useScaffoldReadContract({
    contractName: "CryptoTrophyPlatform",
    functionName: "tokensAvailable",
    args: [organizationId], // Pasar el ID de la organización como argumento
  });

  useEffect(() => {
    if (availableTokens) {
      setMaxPrizeAmount(availableTokens as bigint);
    }
  }, [availableTokens]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateChallenge = async () => {
    const { description, prizeAmount, startTime, endTime, maxWinners } = formData;
    try {
      await createChallenge({
        functionName: "createChallenge",
        args: [
          organizationId,
          description,
          BigInt(prizeAmount),
          BigInt(new Date(startTime).getTime() / 1000),
          BigInt(new Date(endTime).getTime() / 1000),
          BigInt(maxWinners),
        ],
      });
      alert("Challenge created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  // Establecer valores por defecto para fechas
  useEffect(() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 semana después

    setFormData(prev => ({
      ...prev,
      startTime: now.toISOString().slice(0, 16), // Formato `datetime-local`
      endTime: oneWeekLater.toISOString().slice(0, 16),
    }));
  }, []);

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center">Create Challenge</h2>
      <div className="flex flex-col gap-4">
        <textarea
          name="description"
          placeholder="Describe your challenge here (e.g., Complete the task in 7 days)"
          value={formData.description}
          onChange={handleInputChange}
          className="textarea textarea-bordered w-full"
        />
        <div className="relative">
          <input
            type="text"
            name="prizeAmount"
            placeholder={`Prize Amount (Max: ${maxPrizeAmount.toString()} tokens)`}
            value={formData.prizeAmount}
            onChange={handleInputChange}
            className="input input-bordered w-full"
          />
          <span className="absolute right-2 top-2 text-gray-500 text-sm">Max: {maxPrizeAmount.toString()}</span>
        </div>
        <input
          type="datetime-local"
          name="startTime"
          placeholder="Start Time"
          value={formData.startTime}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <input
          type="datetime-local"
          name="endTime"
          placeholder="End Time"
          value={formData.endTime}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          name="maxWinners"
          placeholder="Max Winners (default: 1)"
          value={formData.maxWinners}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <button
          className="btn btn-primary"
          onClick={handleCreateChallenge}
          disabled={!maxPrizeAmount || BigInt(formData.prizeAmount || "0") > maxPrizeAmount}
        >
          Create
        </button>
      </div>
    </Modal>
  );
};

export default CreateChallengeModal;
