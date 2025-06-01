import React from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, imageUrl, buttonLabel, onButtonClick }) => {
  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between text-center md:text-center gap-8 py-16 px-6 mb-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md">
      {/* Left side: Text */}
      <div className="flex flex-col items-center flex-1">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-4">{title}</h1>

        {subtitle && <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md">{subtitle}</p>}

        <button
          onClick={onButtonClick}
          className="btn bg-amber-400 hover:bg-amber-500 text-gray-800 dark:text-gray-900 font-semibold py-3 px-8 rounded shadow-md transition duration-300"
        >
          {buttonLabel}
        </button>
      </div>

      {/* Right side: Normal Image */}
      {imageUrl && (
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md h-auto shadow-lg rounded-md overflow-hidden">
            <img src={imageUrl} alt="Organization" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </section>
  );
};
