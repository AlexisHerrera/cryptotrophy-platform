import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

export const HeroSection = () => {
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  return (
    <section className="w-full relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-24 md:py-32 flex flex-col items-center justify-center shadow-md overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_60%_30%,_rgba(255,255,255,0.14),_rgba(0,0,0,0)_70%)]" />
      <div className="max-w-6xl flex flex-col md:flex-row items-center gap-16 px-6 relative z-10">
        {/* Hero Text */}
        <div className="flex-1 text-center md:text-left" data-aos="fade-right">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-lg">
            Crypto
            <span className="text-yellow-300 drop-shadow-[0_1.5px_0_rgba(255,255,0,0.25)]">Trophy</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-100 mb-10 max-w-xl md:max-w-2xl">
            Join challenges, earn tokens, and win real prizes powered by{" "}
            <span className="text-yellow-200 font-semibold">blockchain</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              onClick={() => router.push("/trophy-app")}
            >
              Explore Challenges
            </button>
          </div>
        </div>
        {/* Hero Image Placeholder */}
        <div className="flex-1 flex justify-center" data-aos="fade-left" data-aos-delay="200">
          <div className="w-full max-w-md h-auto shadow-xl rounded-2xl overflow-hidden bg-white bg-opacity-10 backdrop-blur-lg border border-white/20">
            <img
              src="HomeHeroSection.png"
              alt="CryptoTrophy Hero"
              className="w-full h-full object-cover scale-105 transition-transform duration-300 hover:scale-110"
              style={{ minHeight: 320 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
