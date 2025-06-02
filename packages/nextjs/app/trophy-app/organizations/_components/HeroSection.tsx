import { LogoDisplay } from "./LogoDisplay";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, imageUrl, buttonLabel, onButtonClick }) => {
  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between text-center md:text-center gap-4 py-6 px-4 mb-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md">
      {/* Left side: Text */}
      <div className="flex flex-col items-center flex-1">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600 dark:text-gray-400 mb-3 max-w-md">{subtitle}</p>}
        <button
          onClick={onButtonClick}
          className="btn bg-amber-400 hover:bg-amber-500 text-gray-800 dark:text-gray-900 font-semibold py-2 px-8 rounded shadow-md transition duration-300"
        >
          {buttonLabel}
        </button>
      </div>

      {/* Right side: Image with error handling */}
      <LogoDisplay logoUrl={imageUrl} organizationName={title} />
    </section>
  );
};
