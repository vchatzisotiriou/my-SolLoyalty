import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import CustomerDashboard from "@/pages/CustomerDashboard";
import BusinessPortal from "@/pages/BusinessPortal";
import TokenCreation from "@/pages/TokenCreation";
import { useState, useEffect } from "react";
import { solanaApi } from "./lib/solana";
import { walletService } from "./lib/walletService";
import { useToast } from "@/hooks/use-toast";

// Context for the wallet connection
import { createContext } from "react";
import { User, Business } from "@shared/schema";

export interface WalletContextType {
  connected: boolean;
  walletAddress: string | null;
  connect: () => void;
  disconnect: () => void;
  userInfo: User | null;
  businessInfo: Business | null;
  accountType: 'user' | 'business' | 'new' | null;
  isLoading: boolean;
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  walletAddress: null,
  connect: () => {},
  disconnect: () => {},
  userInfo: null,
  businessInfo: null,
  accountType: null,
  isLoading: false
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerDashboard} />
      <Route path="/business" component={BusinessPortal} />
      <Route path="/token-creation" component={TokenCreation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [businessInfo, setBusinessInfo] = useState<Business | null>(null);
  const [accountType, setAccountType] = useState<'user' | 'business' | 'new' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const connect = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would connect to a Solana wallet like Phantom
      // For now, we'll simulate wallet connection with a sample address
      const generatedWallet = await solanaApi.generateWallet();
      const address = generatedWallet.publicKey;
      
      // Connect to the wallet and determine account type
      const walletInfo = await walletService.connectWallet(address);
      
      setWalletAddress(address);
      setConnected(true);
      setAccountType(walletInfo.type);
      
      if (walletInfo.type === 'user' && walletInfo.user) {
        setUserInfo(walletInfo.user);
        toast({ 
          title: "Connected as User", 
          description: `Welcome back, ${walletInfo.user.username || 'User'}!`
        });
      } else if (walletInfo.type === 'business' && walletInfo.business) {
        setBusinessInfo(walletInfo.business);
        toast({ 
          title: "Connected as Business", 
          description: `Welcome back, ${walletInfo.business.name}!`
        });
      } else if (walletInfo.type === 'new') {
        toast({ 
          title: "New Wallet Connected", 
          description: "Welcome! You'll need to register this wallet as a user or business."
        });
        
        // For demo purposes, automatically register as a user
        const newUser = await walletService.registerNewUser(
          address, 
          `User_${Math.floor(Math.random() * 10000)}`
        );
        setUserInfo(newUser);
        setAccountType('user');
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({ 
        title: "Connection Error", 
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const disconnect = () => {
    setConnected(false);
    setWalletAddress(null);
    setUserInfo(null);
    setBusinessInfo(null);
    setAccountType(null);
    toast({ 
      title: "Disconnected", 
      description: "Your wallet has been disconnected."
    });
  };
  
  const walletContextValue = {
    connected,
    walletAddress,
    connect,
    disconnect,
    userInfo,
    businessInfo,
    accountType,
    isLoading
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletContext.Provider value={walletContextValue}>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </WalletContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
