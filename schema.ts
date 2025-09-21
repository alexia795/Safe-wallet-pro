import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const safes = pgTable("safes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  chainId: integer("chain_id").notNull(),
  threshold: integer("threshold").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const safeOwners = pgTable("safe_owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  safeId: varchar("safe_id").notNull().references(() => safes.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  name: text("name"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  safeId: varchar("safe_id").notNull().references(() => safes.id, { onDelete: "cascade" }),
  safeTxHash: text("safe_tx_hash").unique(),
  to: text("to").notNull(),
  value: decimal("value", { precision: 78, scale: 0 }).notNull(),
  data: text("data"),
  operation: integer("operation").notNull().default(0),
  gasToken: text("gas_token"),
  refundReceiver: text("refund_receiver"),
  nonce: integer("nonce").notNull(),
  executionDate: timestamp("execution_date"),
  submissionDate: timestamp("submission_date").defaultNow(),
  modified: timestamp("modified").defaultNow(),
  blockNumber: integer("block_number"),
  transactionHash: text("transaction_hash"),
  safeTxGas: integer("safe_tx_gas").notNull().default(0),
  baseGas: integer("base_gas").notNull().default(0),
  gasPrice: decimal("gas_price", { precision: 78, scale: 0 }).notNull().default("0"),
  gasUsed: integer("gas_used"),
  fee: decimal("fee", { precision: 78, scale: 0 }),
  origin: text("origin"),
  dataDecoded: jsonb("data_decoded"),
  confirmationsRequired: integer("confirmations_required"),
  confirmations: integer("confirmations").notNull().default(0),
  trusted: boolean("trusted").notNull().default(true),
  signature: text("signature"),
  isExecuted: boolean("is_executed").notNull().default(false),
  isSuccessful: boolean("is_successful"),
});

export const confirmations = pgTable("confirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  owner: text("owner").notNull(),
  submissionDate: timestamp("submission_date").defaultNow(),
  transactionHash: text("transaction_hash"),
  signature: text("signature"),
  signatureType: text("signature_type"),
});

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  safeId: varchar("safe_id").notNull().references(() => safes.id, { onDelete: "cascade" }),
  tokenAddress: text("token_address"),
  tokenName: text("token_name"),
  tokenSymbol: text("token_symbol"),
  tokenDecimals: integer("token_decimals"),
  balance: decimal("balance", { precision: 78, scale: 0 }).notNull(),
  balanceUsd: decimal("balance_usd", { precision: 10, scale: 2 }),
  logoUri: text("logo_uri"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertSafeSchema = createInsertSchema(safes).omit({
  id: true,
  createdAt: true,
});

export const insertSafeOwnerSchema = createInsertSchema(safeOwners).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  submissionDate: true,
  modified: true,
});

export const insertConfirmationSchema = createInsertSchema(confirmations).omit({
  id: true,
  submissionDate: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  lastUpdated: true,
});

export type Safe = typeof safes.$inferSelect;
export type InsertSafe = z.infer<typeof insertSafeSchema>;
export type SafeOwner = typeof safeOwners.$inferSelect;
export type InsertSafeOwner = z.infer<typeof insertSafeOwnerSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Confirmation = typeof confirmations.$inferSelect;
export type InsertConfirmation = z.infer<typeof insertConfirmationSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
