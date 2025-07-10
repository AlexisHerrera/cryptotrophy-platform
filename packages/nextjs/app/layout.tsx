import "@rainbow-me/rainbowkit/styles.css";
import { AnimatePresence } from "framer-motion";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({ title: "CryptoTrophy Platform", description: "CryptoTrophy Platform" });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const isDevelop = process.env.NODE_ENV === "development";
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <AnimatePresence mode="wait">
            <ScaffoldEthAppWithProviders showHeaderAndFooter={isDevelop}>{children}</ScaffoldEthAppWithProviders>
          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
