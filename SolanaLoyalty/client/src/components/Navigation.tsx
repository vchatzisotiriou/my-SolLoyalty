import { useContext, useState } from "react";
import { useLocation } from "wouter";
import { WalletContext } from "@/App";
import TabButton from "@/components/ui/tab-button";
import WalletButton from "@/components/ui/wallet-button";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { connected, walletAddress, connect, disconnect } = useContext(WalletContext);
  
  const getTabState = (path: string) => {
    return location === path;
  };
  
  return (
    <>
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-[#9945FF] to-[#14F195] h-8 w-8 rounded-full"></div>
                <span className="ml-2 text-xl font-semibold">SolLoyalty</span>
              </div>
            </div>
            <div className="flex items-center">
              <WalletButton 
                connected={connected} 
                walletAddress={walletAddress} 
                onConnect={connect} 
                onDisconnect={disconnect} 
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <TabButton 
              label="Customer Dashboard" 
              isActive={getTabState("/")} 
              onClick={() => setLocation("/")} 
            />
            <TabButton 
              label="Business Portal" 
              isActive={getTabState("/business")} 
              onClick={() => setLocation("/business")} 
            />
            <TabButton 
              label="Token Creation" 
              isActive={getTabState("/token-creation")} 
              onClick={() => setLocation("/token-creation")} 
            />
          </div>
        </div>
      </div>
    </>
  );
}
