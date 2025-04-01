import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { type User, type Business } from "@shared/schema";
import { solanaApi } from "./solana";

// Cache keys
export const WALLET_CACHE_KEYS = {
  userInfo: '/api/current-user',
  businessInfo: '/api/current-business',
};

// Types
interface ConnectWalletResponse {
  user?: User;
  business?: Business;
  walletAddress: string;
  type: 'user' | 'business' | 'new';
}

// Wallet service
export const walletService = {
  async connectWallet(walletAddress: string): Promise<ConnectWalletResponse> {
    try {
      // Try to get user by wallet address
      const userRes = await fetch(`/api/users/wallet/${walletAddress}`);
      if (userRes.ok) {
        const user = await userRes.json();
        return { user, walletAddress, type: 'user' };
      }
      
      // Try to get business by wallet address
      const businessRes = await fetch(`/api/businesses/wallet/${walletAddress}`);
      if (businessRes.ok) {
        const business = await businessRes.json();
        return { business, walletAddress, type: 'business' };
      }
      
      // If neither found, return as new user
      return { walletAddress, type: 'new' };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw new Error("Failed to connect wallet");
    }
  },
  
  async registerNewUser(walletAddress: string, username: string): Promise<User> {
    const res = await apiRequest('POST', '/api/users', {
      username,
      walletAddress
    });
    
    const user = await res.json();
    await queryClient.invalidateQueries({ queryKey: [WALLET_CACHE_KEYS.userInfo] });
    return user;
  },
  
  async registerNewBusiness(
    walletAddress: string, 
    name: string, 
    tokenSymbol: string, 
    tokenName: string
  ): Promise<Business> {
    const res = await apiRequest('POST', '/api/businesses', {
      name,
      walletAddress,
      tokenSymbol,
      tokenName
    });
    
    const business = await res.json();
    await queryClient.invalidateQueries({ queryKey: [WALLET_CACHE_KEYS.businessInfo] });
    return business;
  },
  
  async getUserBalance(userId: number, tokenAddress: string): Promise<number> {
    // In a real app, this would query the Solana blockchain via an indexer
    // For now we'll use our mock API
    return solanaApi.getTokenBalance("user-wallet-address", tokenAddress);
  },
  
  async getBusinessTokenInfo(businessId: number): Promise<any> {
    const res = await fetch(`/api/businesses/${businessId}/token`);
    if (!res.ok) {
      throw new Error("Failed to get business token info");
    }
    return res.json();
  }
};