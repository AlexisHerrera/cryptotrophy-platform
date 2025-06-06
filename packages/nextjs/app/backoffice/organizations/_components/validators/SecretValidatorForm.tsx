import React, { useEffect, useRef, useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

interface SecretValidatorFormProps {
  parameterData: Record<string, string | string[]>;
  handleParameterChange: (newParams: Record<string, string | string[]>) => void;
}

function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar-looking
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const SecretValidatorForm: React.FC<SecretValidatorFormProps> = ({ parameterData, handleParameterChange }) => {
  // Set code count from parameterData, fallback to 5
  const [codeCount, setCodeCount] = useState<number>(
    Array.isArray(parameterData.generatedCodes) ? parameterData.generatedCodes.length : 5,
  );
  const [generatedCodes, setGeneratedCodes] = useState<string[]>(
    Array.isArray(parameterData.generatedCodes) ? (parameterData.generatedCodes as string[]) : [],
  );
  const [codeCopied, setCodeCopied] = useState(false);
  const [showCodesPopup, setShowCodesPopup] = useState(false);
  const codesRef = useRef<HTMLDivElement>(null);

  const { data: secretValidator } = useScaffoldContract({ contractName: "SecretValidator" });
  useEffect(() => {
    if (secretValidator?.address) {
      handleParameterChange({ SecretValidatorAddress: secretValidator.address });
    }
  }, [secretValidator?.address]);

  // Generate random secret codes
  const handleGenerateCodes = () => {
    const count = Math.min(Math.max(1, codeCount), 100); // Limit between 1 and 100
    const codes = Array.from({ length: count }, () => generateRandomCode(8));
    setGeneratedCodes(codes);
    handleParameterChange({
      secretCodes: codes.join("\n"),
      generatedCodes: codes,
    });
    setCodeCopied(false);
  };

  // Copy all generated codes to clipboard
  const handleCopyAllCodes = () => {
    if (generatedCodes.length > 0) {
      navigator.clipboard
        .writeText(generatedCodes.join("\n"))
        .then(() => {
          setCodeCopied(true);
          setTimeout(() => setCodeCopied(false), 3000);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error("Failed to copy codes: ", err);
          alert("Failed to copy codes to clipboard");
        });
    }
  };

  return (
    <div>
      <label className="flex items-center gap-1 mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
        Secret Codes Generator
        <span
          className="tooltip"
          title="Codes are hashed with Poseidon and stored on-chain. Only the hash is stored, making the original codes unrecoverable once set."
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </label>
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
        <div className="flex items-end gap-2 mb-2">
          <div className="w-full max-w-xs">
            <label className="block mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
              Number of codes to generate
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={codeCount}
              onChange={e => setCodeCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button className="btn btn-primary" type="button" onClick={handleGenerateCodes}>
            Generate Codes
          </button>
        </div>
        {generatedCodes.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="font-medium">Generated Codes:</span>
                <span className="inline-block bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs">
                  {generatedCodes.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn btn-xs btn-secondary" type="button" onClick={() => setShowCodesPopup(true)}>
                  View Codes
                </button>
                <button
                  className={`btn btn-xs ${codeCopied ? "btn-success" : "btn-info"}`}
                  type="button"
                  onClick={handleCopyAllCodes}
                >
                  {codeCopied ? (
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    "Copy All"
                  )}
                </button>
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 p-2 rounded-md mb-2 text-yellow-900 dark:text-yellow-200 text-sm">
              <div className="flex items-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  <strong>Important:</strong> These codes will be stored in a hashed format and cannot be recovered
                  later. Please make sure to copy and save them now.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Codes Popup */}
      {showCodesPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowCodesPopup(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-3 m-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Secret Codes</h3>
              <button className="btn btn-xs btn-circle" type="button" onClick={() => setShowCodesPopup(false)}>
                ✕
              </button>
            </div>
            <div
              ref={codesRef}
              className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg overflow-auto max-h-[250px] font-mono text-sm"
            >
              {generatedCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-1 mb-1">
                  <span className="inline-block bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs">
                    {index + 1}
                  </span>
                  <code>{code}</code>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2 gap-1">
              <button
                className={`btn btn-xs ${codeCopied ? "btn-success" : "btn-primary"}`}
                type="button"
                onClick={handleCopyAllCodes}
              >
                {codeCopied ? "Copied!" : "Copy All Codes"}
              </button>
              <button className="btn btn-xs btn-outline" type="button" onClick={() => setShowCodesPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
