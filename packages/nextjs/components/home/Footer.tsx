import { SwitchTheme } from "~~/components/SwitchTheme";

type FooterProps = {
  connectedAddress?: string;
};

export const Footer = ({ connectedAddress }: FooterProps) => (
  <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
    <div>
      {connectedAddress ? <p>Connected Wallet: {connectedAddress}</p> : <p>Connect your wallet to get started.</p>}
    </div>
    <div className="mt-2">&copy; {new Date().getFullYear()} CryptoTrophy. All rights reserved.</div>
    <SwitchTheme className={`pointer-events-auto`} />
  </footer>
);
