import { useRouter } from "next/navigation";

export const OrganizationsInfo = () => {
  const router = useRouter();
  return (
    <section className="max-w-5xl mx-auto py-16 px-6 flex flex-col md:flex-row items-center gap-12">
      {/* Placeholder for image */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md h-auto shadow-lg rounded-md overflow-hidden">
          <img src="HomeOrganizations.webp" alt="Organization" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Are You an Organization?</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Bring your community to life! Create and manage challenges, distribute rewards, and grow engagement with
          CryptoTrophy’s organization dashboard.
        </p>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-7 rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
          onClick={() => router.push("/backoffice")}
        >
          Organization Portal
        </button>
      </div>
    </section>
  );
};
