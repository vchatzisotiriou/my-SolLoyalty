import { 
  users, type User, type InsertUser,
  businesses, type Business, type InsertBusiness,
  tokens, type Token, type InsertToken,
  rewards, type Reward, type InsertReward,
  transactions, type Transaction, type InsertTransaction 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByWalletAddress(walletAddress: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  getAllBusinesses(): Promise<Business[]>;
  
  // Token operations
  getToken(id: number): Promise<Token | undefined>;
  getTokenByBusinessId(businessId: number): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  
  // Reward operations
  getReward(id: number): Promise<Reward | undefined>;
  getRewardsByBusinessId(businessId: number): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, reward: Partial<InsertReward>): Promise<Reward | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByBusinessId(businessId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businesses: Map<number, Business>;
  private tokens: Map<number, Token>;
  private rewards: Map<number, Reward>;
  private transactions: Map<number, Transaction>;
  
  currentUserId: number;
  currentBusinessId: number;
  currentTokenId: number;
  currentRewardId: number;
  currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.tokens = new Map();
    this.rewards = new Map();
    this.transactions = new Map();
    
    this.currentUserId = 1;
    this.currentBusinessId = 1;
    this.currentTokenId = 1;
    this.currentRewardId = 1;
    this.currentTransactionId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample business
    const business: Business = {
      id: this.currentBusinessId++,
      name: "Coffee Shop",
      walletAddress: "9xJ4rK...2VnM",
      tokenSymbol: "SLOY",
      tokenName: "SolLoyalty Token",
    };
    this.businesses.set(business.id, business);
    
    // Sample token
    const token: Token = {
      id: this.currentTokenId++,
      businessId: business.id,
      name: "SolLoyalty Token",
      symbol: "SLOY",
      supply: 1000000,
      decimals: 6,
      mintable: true,
      freezable: false,
      mintAuthority: business.walletAddress,
      createdAt: new Date(),
    };
    this.tokens.set(token.id, token);
    
    // Sample rewards
    const rewards: InsertReward[] = [
      {
        businessId: business.id,
        name: "$10 Discount",
        description: "Use your tokens for a discount on your next purchase.",
        tokenCost: 200,
        isActive: true,
      },
      {
        businessId: business.id,
        name: "Free Coffee",
        description: "Redeem for a free coffee at any participating location.",
        tokenCost: 150,
        isActive: true,
      },
      {
        businessId: business.id,
        name: "Priority Service",
        description: "Skip the line with priority service at partner locations.",
        tokenCost: 100,
        isActive: true,
      },
    ];
    
    rewards.forEach(reward => {
      this.rewards.set(this.currentRewardId, {
        ...reward,
        id: this.currentRewardId++,
      });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Business operations
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }
  
  async getBusinessByWalletAddress(walletAddress: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(
      (business) => business.walletAddress === walletAddress,
    );
  }
  
  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.currentBusinessId++;
    const business: Business = { ...insertBusiness, id };
    this.businesses.set(id, business);
    return business;
  }
  
  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }
  
  // Token operations
  async getToken(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }
  
  async getTokenByBusinessId(businessId: number): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(
      (token) => token.businessId === businessId,
    );
  }
  
  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const token: Token = { ...insertToken, id, createdAt: new Date() };
    this.tokens.set(id, token);
    return token;
  }
  
  // Reward operations
  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }
  
  async getRewardsByBusinessId(businessId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.businessId === businessId,
    );
  }
  
  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.currentRewardId++;
    const reward: Reward = { ...insertReward, id };
    this.rewards.set(id, reward);
    return reward;
  }
  
  async updateReward(id: number, rewardUpdate: Partial<InsertReward>): Promise<Reward | undefined> {
    const reward = this.rewards.get(id);
    if (!reward) return undefined;
    
    const updatedReward = { ...reward, ...rewardUpdate };
    this.rewards.set(id, updatedReward);
    return updatedReward;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getTransactionsByBusinessId(businessId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.businessId === businessId,
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, status };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
}

export const storage = new MemStorage();
