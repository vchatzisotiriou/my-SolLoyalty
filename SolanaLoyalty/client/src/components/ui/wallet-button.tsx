import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface WalletButtonProps {
  connected: boolean;
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletButton({
  connected,
  walletAddress,
  onConnect,
  onDisconnect
}: WalletButtonProps) {
  return (
    <Button
      variant="default"
      className="ml-3 bg-gray-800 text-white hover:bg-gray-700"
      onClick={connected ? onDisconnect : onConnect}
    >
      <span className="mr-2">
        {connected ? formatAddress(walletAddress || '') : "Connect Wallet"}
      </span>
      <Menu className="h-5 w-5" />
    </Button>
  );
}
