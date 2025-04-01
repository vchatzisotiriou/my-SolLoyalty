import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  tokenSymbol: text("token_symbol"),
  tokenName: text("token_name"),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  supply: integer("supply").notNull(),
  decimals: integer("decimals").notNull().default(6),
  mintable: boolean("mintable").notNull().default(false),
  freezable: boolean("freezable").notNull().default(false),
  mintAuthority: text("mint_authority").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tokenCost: integer("token_cost").notNull(),
  isActive: boolean("is_active").notNull().default(true)
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  businessId: integer("business_id").notNull(),
  type: text("type").notNull(), // 'earn' or 'redeem'
  amount: integer("amount").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).pick({
  name: true,
  walletAddress: true,
  tokenSymbol: true,
  tokenName: true,
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  businessId: true,
  name: true,
  symbol: true,
  supply: true,
  decimals: true,
  mintable: true,
  freezable: true,
  mintAuthority: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  businessId: true,
  name: true,
  description: true,
  tokenCost: true,
  isActive: true
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  businessId: true,
  type: true,
  amount: true,
  description: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
