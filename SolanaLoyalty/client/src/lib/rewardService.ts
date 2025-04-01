import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { type Reward, type Transaction } from "@shared/schema";
import { solanaApi } from "./solana";

// Cache keys
export const REWARD_CACHE_KEYS = {
  businessRewards: (businessId: number) => [`/api/businesses/${businessId}/rewards`],
  userTransactions: (userId: number) => [`/api/users/${userId}/transactions`],
  businessTransactions: (businessId: number) => [`/api/businesses/${businessId}/transactions`]
};

// Reward service
export const rewardService = {
  async getRewardsByBusiness(businessId: number): Promise<Reward[]> {
    const res = await fetch(`/api/businesses/${businessId}/rewards`);
    if (!res.ok) {
      throw new Error("Failed to get rewards");
    }
    return res.json();
  },
  
  async createReward(reward: {
    businessId: number;
    name: string;
    description: string;
    tokenCost: number;
    isActive: boolean;
  }): Promise<Reward> {
    const res = await apiRequest('POST', '/api/rewards', reward);
    const newReward = await res.json();
    
    // Invalidate rewards cache for this business
    await queryClient.invalidateQueries({ 
      queryKey: REWARD_CACHE_KEYS.businessRewards(reward.businessId) 
    });
    
    return newReward;
  },
  
  async updateReward(rewardId: number, businessId: number, updates: Partial<Reward>): Promise<Reward> {
    const res = await apiRequest('PATCH', `/api/rewards/${rewardId}`, updates);
    const updatedReward = await res.json();
    
    // Invalidate rewards cache for this business
    await queryClient.invalidateQueries({ 
      queryKey: REWARD_CACHE_KEYS.businessRewards(businessId) 
    });
    
    return updatedReward;
  },
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const res = await fetch(`/api/users/${userId}/transactions`);
    if (!res.ok) {
      throw new Error("Failed to get user transactions");
    }
    return res.json();
  },
  
  async getBusinessTransactions(businessId: number): Promise<Transaction[]> {
    const res = await fetch(`/api/businesses/${businessId}/transactions`);
    if (!res.ok) {
      throw new Error("Failed to get business transactions");
    }
    return res.json();
  },
  
  async createTransaction(transaction: {
    userId?: number;
    businessId: number;
    amount: number;
    type: string;
    status: string;
    description: string;
    tokenAddress?: string;
  }): Promise<Transaction> {
    const res = await apiRequest('POST', '/api/transactions', transaction);
    const newTransaction = await res.json();
    
    // Invalidate relevant caches
    if (transaction.userId) {
      await queryClient.invalidateQueries({ 
        queryKey: REWARD_CACHE_KEYS.userTransactions(transaction.userId) 
      });
    }
    
    await queryClient.invalidateQueries({ 
      queryKey: REWARD_CACHE_KEYS.businessTransactions(transaction.businessId) 
    });
    
    return newTransaction;
  },
  
  async redeemReward(
    userId: number, 
    businessId: number, 
    rewardId: number, 
    tokenAddress: string
  ): Promise<Transaction> {
    // 1. Get the reward to determine token cost
    const res = await fetch(`/api/rewards/${rewardId}`);
    if (!res.ok) {
      throw new Error("Failed to get reward details");
    }
    const reward = await res.json();
    
    // 2. Create a transaction record for this redemption
    const transaction = await this.createTransaction({
      userId,
      businessId,
      amount: -reward.tokenCost, // Negative amount for redemption
      type: 'redeem',
      status: 'pending',
      description: `Redeemed: ${reward.name}`,
      tokenAddress
    });
    
    // 3. In a real app, this would execute a Solana transaction
    // For now, use the mock API
    await solanaApi.transferTokens(
      "user-wallet-address", 
      "business-wallet-address", 
      tokenAddress, 
      reward.tokenCost
    );
    
    // 4. Update transaction status to completed
    const updateRes = await apiRequest(
      'PATCH', 
      `/api/transactions/${transaction.id}/status`, 
      { status: 'completed' }
    );
    
    return updateRes.json();
  },
  
  async earnTokens(
    userId: number, 
    businessId: number, 
    amount: number, 
    description: string,
    tokenAddress: string
  ): Promise<Transaction> {
    // 1. Create a transaction record
    const transaction = await this.createTransaction({
      userId,
      businessId,
      amount, // Positive amount for earning
      type: 'earn',
      status: 'pending',
      description,
      tokenAddress
    });
    
    // 2. In a real app, this would execute a Solana transaction
    // For now, mock it
    await solanaApi.transferTokens(
      "business-wallet-address", 
      "user-wallet-address", 
      tokenAddress, 
      amount
    );
    
    // 3. Update transaction status
    const updateRes = await apiRequest(
      'PATCH', 
      `/api/transactions/${transaction.id}/status`, 
      { status: 'completed' }
    );
    
    return updateRes.json();
  }
};