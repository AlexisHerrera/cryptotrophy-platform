import { useState } from "react";
import Modal from "~~/components/Modal";

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
    maxWinners: "",
  });

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

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center">Create Challenge</h2>
      <div className="flex flex-col gap-4">
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          className="textarea textarea-bordered w-full"
        />
        <input
          type="text"
          name="prizeAmount"
          placeholder="Prize Amount"
          value={formData.prizeAmount}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
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
          placeholder="Max Winners"
          value={formData.maxWinners}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
        <button className="btn btn-primary" onClick={handleCreateChallenge}>
          Create
        </button>
      </div>
    </Modal>
  );
};

export default CreateChallengeModal;
