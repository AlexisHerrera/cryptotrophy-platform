import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export const ParticipantFeatures = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const steps = [
    {
      icon: "🌐",
      title: "Find Organizations That Matter",
      desc: "Explore local and global organizations aligned with your passions, so every challenge feels personal and rewarding.",
    },
    {
      icon: "🎯",
      title: "Find Your Challenge",
      desc: "Browse challenges that match your skills or passions. Always something new to explore.",
    },
    {
      icon: "⚡",
      title: "Show What You Can Do",
      desc: "Take part by completing tasks, submitting solutions, or creating—your skills, your pace. Earn verified blockchain tokens for every achievement.",
    },
    {
      icon: "🏆",
      title: "Claim Real Rewards",
      desc: "Turn your tokens into exclusive prizes, experiences, and opportunities—all directly on the platform.",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto py-28 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold mb-5">Join Challenges. Earn Rewards.</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Participate in exciting challenges, earn blockchain tokens, and redeem them for real prizes all in one
          seamless web3 experience.
        </p>
      </div>

      <div className="flex flex-col space-y-16 w-full">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start space-y-6 md:space-y-0 md:space-x-8"
            data-aos="fade-up"
            data-aos-delay={idx * 200}
          >
            <div className="flex-shrink-0">
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 dark:from-indigo-700 dark:to-pink-700 flex items-center justify-center text-5xl shadow-2xl border-4 border-white dark:border-gray-900 transform hover:scale-105 transition-transform duration-300"
                style={{ minWidth: "6rem" }}
              >
                {step.icon}
              </div>
            </div>
            <div className="text-center md:text-left max-w-xl">
              <h4 className="text-2xl font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
