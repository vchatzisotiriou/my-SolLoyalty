import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { type Token } from "@shared/schema";
import { solanaApi, type SolanaToken } from "./solana";

// Cache keys
export const TOKEN_CACHE_KEYS = {
  businessToken: (businessId: number) => [`/api/businesses/${businessId}/token`],
  tokenDetails: (tokenId: number) => [`/api/tokens/${tokenId}`]
};

// Token service
export const tokenService = {
  async getTokenByBusiness(businessId: number): Promise<Token | null> {
    try {
      const res = await fetch(`/api/businesses/${businessId}/token`);
      if (!res.ok) {
        if (res.status === 404) {
          return null; // No token exists yet
        }
        throw new Error("Failed to get token");
      }
      return res.json();
    } catch (error) {
      console.error("Error fetching token:", error);
      return null;
    }
  },
  
  async createToken(tokenData: {
    businessId: number;
    name: string;
    symbol: string;
    supply: number;
    decimals: number;
    mintable: boolean;
    freezable: boolean;
    mintAuthority: string;
  }): Promise<Token> {
    // 1. First, create the token on Solana blockchain (simulated)
    const solanaToken = await solanaApi.createToken(
      tokenData.name,
      tokenData.symbol,
      tokenData.decimals,
      tokenData.supply,
      tokenData.mintable,
      tokenData.freezable
    );
    
    // 2. Store the token information in our database
    const res = await apiRequest('POST', '/api/tokens', {
      ...tokenData,
      // Add the Solana token address to our record
      tokenAddress: solanaToken.address
    });
    
    const newToken = await res.json();
    
    // 3. Invalidate relevant caches
    await queryClient.invalidateQueries({ 
      queryKey: TOKEN_CACHE_KEYS.businessToken(tokenData.businessId) 
    });
    
    return newToken;
  },
  
  async getTokenDetails(tokenId: number): Promise<Token> {
    const res = await fetch(`/api/tokens/${tokenId}`);
    if (!res.ok) {
      throw new Error("Failed to get token details");
    }
    return res.json();
  },
  
  async getSolanaTokenInfo(tokenAddress: string): Promise<SolanaToken> {
    // In a real app, this would query the Solana blockchain
    // For now, return mock data that matches our token schema
    return {
      address: tokenAddress,
      symbol: "SLOY",
      name: "SolLoyalty Token",
      totalSupply: 1000000,
      decimals: 6,
      mintAuthority: "9xJ4rK...2VnM",
      freezeAuthority: null
    };
  },
  
  async mintAdditionalTokens(
    tokenId: number, 
    businessId: number, 
    amount: number
  ): Promise<Token> {
    // 1. Get current token
    const token = await this.getTokenDetails(tokenId);
    
    if (!token.mintable) {
      throw new Error("This token is not configured to allow additional minting");
    }
    
    // 2. In a real app, call Solana to mint additional tokens
    // For demo purposes, just update our database record
    const updatedSupply = token.supply + amount;
    
    // 3. Update the token in the database (note: in a real app, 
    // this would be an endpoint specifically for minting)
    const res = await apiRequest('PATCH', `/api/tokens/${tokenId}`, {
      supply: updatedSupply
    });
    
    const updatedToken = await res.json();
    
    // 4. Invalidate relevant caches
    await queryClient.invalidateQueries({ 
      queryKey: TOKEN_CACHE_KEYS.businessToken(businessId) 
    });
    await queryClient.invalidateQueries({ 
      queryKey: TOKEN_CACHE_KEYS.tokenDetails(tokenId) 
    });
    
    return updatedToken;
  }
};