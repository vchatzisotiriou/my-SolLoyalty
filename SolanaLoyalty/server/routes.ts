import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBusinessSchema, insertTokenSchema, insertRewardSchema, insertTransactionSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route('/api');
  
  // Users API
  app.get('/api/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user);
  });
  
  app.get('/api/users/wallet/:address', async (req, res) => {
    const { address } = req.params;
    const user = await storage.getUserByWalletAddress(address);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user);
  });
  
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  // Businesses API
  app.get('/api/businesses', async (req, res) => {
    const businesses = await storage.getAllBusinesses();
    return res.json(businesses);
  });
  
  app.get('/api/businesses/:id', async (req, res) => {
    const businessId = parseInt(req.params.id);
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    const business = await storage.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    return res.json(business);
  });
  
  app.get('/api/businesses/wallet/:address', async (req, res) => {
    const { address } = req.params;
    const business = await storage.getBusinessByWalletAddress(address);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    return res.json(business);
  });
  
  app.post('/api/businesses', async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(businessData);
      return res.status(201).json(business);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid business data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to create business' });
    }
  });
  
  // Tokens API
  app.get('/api/tokens/:id', async (req, res) => {
    const tokenId = parseInt(req.params.id);
    if (isNaN(tokenId)) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }
    
    const token = await storage.getToken(tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    return res.json(token);
  });
  
  app.get('/api/businesses/:businessId/token', async (req, res) => {
    const businessId = parseInt(req.params.businessId);
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    const token = await storage.getTokenByBusinessId(businessId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found for this business' });
    }
    
    return res.json(token);
  });
  
  app.post('/api/tokens', async (req, res) => {
    try {
      const tokenData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken(tokenData);
      return res.status(201).json(token);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid token data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to create token' });
    }
  });
  
  // Rewards API
  app.get('/api/rewards/:id', async (req, res) => {
    const rewardId = parseInt(req.params.id);
    if (isNaN(rewardId)) {
      return res.status(400).json({ message: 'Invalid reward ID' });
    }
    
    const reward = await storage.getReward(rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    return res.json(reward);
  });
  
  app.get('/api/businesses/:businessId/rewards', async (req, res) => {
    const businessId = parseInt(req.params.businessId);
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    const rewards = await storage.getRewardsByBusinessId(businessId);
    return res.json(rewards);
  });
  
  app.post('/api/rewards', async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      return res.status(201).json(reward);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid reward data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to create reward' });
    }
  });
  
  app.patch('/api/rewards/:id', async (req, res) => {
    const rewardId = parseInt(req.params.id);
    if (isNaN(rewardId)) {
      return res.status(400).json({ message: 'Invalid reward ID' });
    }
    
    try {
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }
      
      const updatedReward = await storage.updateReward(rewardId, req.body);
      return res.json(updatedReward);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update reward' });
    }
  });
  
  // Transactions API
  app.get('/api/transactions/:id', async (req, res) => {
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
    
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    return res.json(transaction);
  });
  
  app.get('/api/users/:userId/transactions', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const transactions = await storage.getTransactionsByUserId(userId);
    return res.json(transactions);
  });
  
  app.get('/api/businesses/:businessId/transactions', async (req, res) => {
    const businessId = parseInt(req.params.businessId);
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    const transactions = await storage.getTransactionsByBusinessId(businessId);
    return res.json(transactions);
  });
  
  app.post('/api/transactions', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      return res.status(500).json({ message: 'Failed to create transaction' });
    }
  });
  
  app.patch('/api/transactions/:id/status', async (req, res) => {
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }
    
    const { status } = req.body;
    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    try {
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      const updatedTransaction = await storage.updateTransactionStatus(transactionId, status);
      return res.json(updatedTransaction);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update transaction status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
