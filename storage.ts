import { 
  type Safe, 
  type InsertSafe, 
  type SafeOwner, 
  type InsertSafeOwner,
  type Transaction, 
  type InsertTransaction,
  type Confirmation, 
  type InsertConfirmation,
  type Asset, 
  type InsertAsset 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Safe operations
  getSafe(id: string): Promise<Safe | undefined>;
  getSafeByAddress(address: string, chainId: number): Promise<Safe | undefined>;
  createSafe(safe: InsertSafe): Promise<Safe>;
  updateSafe(id: string, safe: Partial<InsertSafe>): Promise<Safe | undefined>;
  getAllSafes(): Promise<Safe[]>;

  // Safe owner operations
  getSafeOwners(safeId: string): Promise<SafeOwner[]>;
  addSafeOwner(owner: InsertSafeOwner): Promise<SafeOwner>;
  removeSafeOwner(safeId: string, address: string): Promise<void>;

  // Transaction operations
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionBySafeTxHash(safeTxHash: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  getSafeTransactions(safeId: string, limit?: number): Promise<Transaction[]>;
  getPendingTransactions(safeId: string): Promise<Transaction[]>;

  // Confirmation operations
  getConfirmations(transactionId: string): Promise<Confirmation[]>;
  addConfirmation(confirmation: InsertConfirmation): Promise<Confirmation>;
  removeConfirmation(transactionId: string, owner: string): Promise<void>;

  // Asset operations
  getSafeAssets(safeId: string): Promise<Asset[]>;
  updateAsset(asset: InsertAsset): Promise<Asset>;
  removeAsset(safeId: string, tokenAddress: string): Promise<void>;

  // Admin operations
  getSystemStats(): Promise<{
    totalSafes: number;
    activeUsers: number;
    totalTransactions: number;
    totalValue: number;
    pendingApprovals: number;
    systemAlerts: number;
    networkHealth: number;
    uptimePercent: number;
  }>;
  getRecentSafes(limit?: number): Promise<Safe[]>;
  getSystemAlerts(): Promise<Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>;
  getAnalytics(timeframe: '24h' | '7d' | '30d' | '90d'): Promise<{
    newSafes: number;
    transactions: number;
    successRate: number;
    previousPeriodComparison: {
      safes: number;
      transactions: number;
      successRate: number;
    };
  }>;
}

export class MemStorage implements IStorage {
  private safes: Map<string, Safe> = new Map();
  private safeOwners: Map<string, SafeOwner> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private confirmations: Map<string, Confirmation> = new Map();
  private assets: Map<string, Asset> = new Map();

  // Safe operations
  async getSafe(id: string): Promise<Safe | undefined> {
    return this.safes.get(id);
  }

  async getSafeByAddress(address: string, chainId: number): Promise<Safe | undefined> {
    return Array.from(this.safes.values()).find(
      (safe) => safe.address.toLowerCase() === address.toLowerCase() && safe.chainId === chainId
    );
  }

  async createSafe(insertSafe: InsertSafe): Promise<Safe> {
    const id = randomUUID();
    const safe: Safe = { 
      ...insertSafe, 
      id, 
      name: insertSafe.name || null,
      createdAt: new Date() 
    };
    this.safes.set(id, safe);
    return safe;
  }

  async updateSafe(id: string, updates: Partial<InsertSafe>): Promise<Safe | undefined> {
    const safe = this.safes.get(id);
    if (!safe) return undefined;

    const updatedSafe = { ...safe, ...updates };
    this.safes.set(id, updatedSafe);
    return updatedSafe;
  }

  async getAllSafes(): Promise<Safe[]> {
    return Array.from(this.safes.values());
  }

  // Safe owner operations
  async getSafeOwners(safeId: string): Promise<SafeOwner[]> {
    return Array.from(this.safeOwners.values()).filter(
      (owner) => owner.safeId === safeId
    );
  }

  async addSafeOwner(insertOwner: InsertSafeOwner): Promise<SafeOwner> {
    const id = randomUUID();
    const owner: SafeOwner = { 
      ...insertOwner, 
      id,
      name: insertOwner.name || null
    };
    this.safeOwners.set(id, owner);
    return owner;
  }

  async removeSafeOwner(safeId: string, address: string): Promise<void> {
    for (const [id, owner] of Array.from(this.safeOwners.entries())) {
      if (owner.safeId === safeId && owner.address.toLowerCase() === address.toLowerCase()) {
        this.safeOwners.delete(id);
        break;
      }
    }
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionBySafeTxHash(safeTxHash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.safeTxHash === safeTxHash
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      data: insertTransaction.data || null,
      gasToken: insertTransaction.gasToken || null,
      refundReceiver: insertTransaction.refundReceiver || null,
      origin: insertTransaction.origin || null,
      safeTxHash: insertTransaction.safeTxHash || null,
      executionDate: insertTransaction.executionDate || null,
      blockNumber: insertTransaction.blockNumber || null,
      transactionHash: insertTransaction.transactionHash || null,
      gasUsed: insertTransaction.gasUsed || null,
      fee: insertTransaction.fee || null,
      dataDecoded: insertTransaction.dataDecoded || null,
      confirmationsRequired: insertTransaction.confirmationsRequired || null,
      isSuccessful: insertTransaction.isSuccessful || null,
      signature: insertTransaction.signature || null,
      operation: insertTransaction.operation || 0,
      safeTxGas: insertTransaction.safeTxGas || 0,
      baseGas: insertTransaction.baseGas || 0,
      gasPrice: insertTransaction.gasPrice || "0",
      confirmations: insertTransaction.confirmations || 0,
      trusted: insertTransaction.trusted !== undefined ? insertTransaction.trusted : true,
      isExecuted: insertTransaction.isExecuted !== undefined ? insertTransaction.isExecuted : false,
      submissionDate: new Date(),
      modified: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { 
      ...transaction, 
      ...updates, 
      modified: new Date() 
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getSafeTransactions(safeId: string, limit: number = 10): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.safeId === safeId)
      .sort((a, b) => (b.submissionDate?.getTime() || 0) - (a.submissionDate?.getTime() || 0))
      .slice(0, limit);
  }

  async getPendingTransactions(safeId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.safeId === safeId && !tx.isExecuted)
      .sort((a, b) => (b.submissionDate?.getTime() || 0) - (a.submissionDate?.getTime() || 0));
  }

  // Confirmation operations
  async getConfirmations(transactionId: string): Promise<Confirmation[]> {
    return Array.from(this.confirmations.values()).filter(
      (conf) => conf.transactionId === transactionId
    );
  }

  async addConfirmation(insertConfirmation: InsertConfirmation): Promise<Confirmation> {
    const id = randomUUID();
    const confirmation: Confirmation = {
      ...insertConfirmation,
      id,
      transactionHash: insertConfirmation.transactionHash || null,
      signature: insertConfirmation.signature || null,
      signatureType: insertConfirmation.signatureType || null,
      submissionDate: new Date(),
    };
    this.confirmations.set(id, confirmation);
    return confirmation;
  }

  async removeConfirmation(transactionId: string, owner: string): Promise<void> {
    for (const [id, conf] of Array.from(this.confirmations.entries())) {
      if (conf.transactionId === transactionId && conf.owner.toLowerCase() === owner.toLowerCase()) {
        this.confirmations.delete(id);
        break;
      }
    }
  }

  // Asset operations
  async getSafeAssets(safeId: string): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.safeId === safeId
    );
  }

  async updateAsset(insertAsset: InsertAsset): Promise<Asset> {
    // Find existing asset or create new one
    const existingAsset = Array.from(this.assets.values()).find(
      (asset) => asset.safeId === insertAsset.safeId && 
                 asset.tokenAddress === insertAsset.tokenAddress
    );

    if (existingAsset) {
      const updatedAsset = { 
        ...existingAsset, 
        ...insertAsset, 
        lastUpdated: new Date() 
      };
      this.assets.set(existingAsset.id, updatedAsset);
      return updatedAsset;
    } else {
      const id = randomUUID();
      const asset: Asset = {
        ...insertAsset,
        id,
        tokenAddress: insertAsset.tokenAddress || null,
        tokenName: insertAsset.tokenName || null,
        tokenSymbol: insertAsset.tokenSymbol || null,
        tokenDecimals: insertAsset.tokenDecimals || null,
        balanceUsd: insertAsset.balanceUsd || null,
        logoUri: insertAsset.logoUri || null,
        lastUpdated: new Date(),
      };
      this.assets.set(id, asset);
      return asset;
    }
  }

  async removeAsset(safeId: string, tokenAddress: string): Promise<void> {
    for (const [id, asset] of Array.from(this.assets.entries())) {
      if (asset.safeId === safeId && asset.tokenAddress === tokenAddress) {
        this.assets.delete(id);
        break;
      }
    }
  }

  // Admin operations
  async getSystemStats(): Promise<{
    totalSafes: number;
    activeUsers: number;
    totalTransactions: number;
    totalValue: number;
    pendingApprovals: number;
    systemAlerts: number;
    networkHealth: number;
    uptimePercent: number;
  }> {
    const totalSafes = this.safes.size;
    const allTransactions = Array.from(this.transactions.values());
    const totalTransactions = allTransactions.length;
    const pendingTransactions = allTransactions.filter(tx => !tx.isExecuted);
    const pendingApprovals = pendingTransactions.length;
    
    // Calculate unique users (safe owners)
    const uniqueOwners = new Set();
    for (const owner of this.safeOwners.values()) {
      uniqueOwners.add(owner.address.toLowerCase());
    }
    const activeUsers = uniqueOwners.size;

    // Calculate total value from all assets
    let totalValue = 0;
    for (const asset of this.assets.values()) {
      totalValue += asset.balanceUsd || 0;
    }

    // Mock some health metrics (in real app, these would come from system monitoring)
    const alerts = await this.getSystemAlerts();
    
    return {
      totalSafes,
      activeUsers,
      totalTransactions,
      totalValue,
      pendingApprovals,
      systemAlerts: alerts.length,
      networkHealth: 98.7, // Mock value
      uptimePercent: 99.9, // Mock value
    };
  }

  async getRecentSafes(limit: number = 10): Promise<Safe[]> {
    return Array.from(this.safes.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getSystemAlerts(): Promise<Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>> {
    const alerts = [];
    const now = new Date();
    
    // Check for high transaction volume
    const recentTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.submissionDate && (now.getTime() - tx.submissionDate.getTime()) < 3600000); // Last hour
    
    if (recentTransactions.length > 10) {
      alerts.push({
        id: 'high-tx-volume',
        type: 'warning' as const,
        message: 'High transaction volume detected on Ethereum mainnet',
        timestamp: new Date(now.getTime() - 2 * 60000) // 2 minutes ago
      });
    }

    // Check for failed transactions
    const failedTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.isSuccessful === false && tx.submissionDate && 
        (now.getTime() - tx.submissionDate.getTime()) < 3600000);

    if (failedTransactions.length > 0) {
      alerts.push({
        id: 'failed-transactions',
        type: 'error' as const,
        message: `${failedTransactions.length} transaction(s) failed in the last hour`,
        timestamp: new Date(now.getTime() - 15 * 60000) // 15 minutes ago
      });
    }

    // Add a maintenance info alert
    alerts.push({
      id: 'maintenance-info',
      type: 'info' as const,
      message: 'Scheduled maintenance window approaching',
      timestamp: new Date(now.getTime() - 3600000) // 1 hour ago
    });

    return alerts.slice(0, 5); // Return max 5 alerts
  }

  async getAnalytics(timeframe: '24h' | '7d' | '30d' | '90d'): Promise<{
    newSafes: number;
    transactions: number;
    successRate: number;
    previousPeriodComparison: {
      safes: number;
      transactions: number;
      successRate: number;
    };
  }> {
    const now = new Date();
    let periodMs = 0;
    
    switch (timeframe) {
      case '24h':
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case '7d':
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        periodMs = 90 * 24 * 60 * 60 * 1000;
        break;
    }

    const periodStart = new Date(now.getTime() - periodMs);
    const previousPeriodStart = new Date(now.getTime() - 2 * periodMs);

    // Current period stats
    const newSafes = Array.from(this.safes.values())
      .filter(safe => safe.createdAt && safe.createdAt >= periodStart).length;

    const currentTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.submissionDate && tx.submissionDate >= periodStart);
    
    const transactions = currentTransactions.length;
    const successfulTx = currentTransactions.filter(tx => tx.isSuccessful !== false).length;
    const successRate = transactions > 0 ? (successfulTx / transactions) * 100 : 100;

    // Previous period stats for comparison
    const previousSafes = Array.from(this.safes.values())
      .filter(safe => safe.createdAt && 
        safe.createdAt >= previousPeriodStart && 
        safe.createdAt < periodStart).length;

    const previousTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.submissionDate && 
        tx.submissionDate >= previousPeriodStart && 
        tx.submissionDate < periodStart);

    const prevTxCount = previousTransactions.length;
    const prevSuccessfulTx = previousTransactions.filter(tx => tx.isSuccessful !== false).length;
    const prevSuccessRate = prevTxCount > 0 ? (prevSuccessfulTx / prevTxCount) * 100 : 100;

    // Calculate percentage changes
    const safesChange = previousSafes > 0 ? ((newSafes - previousSafes) / previousSafes) * 100 : 0;
    const txChange = prevTxCount > 0 ? ((transactions - prevTxCount) / prevTxCount) * 100 : 0;
    const successRateChange = successRate - prevSuccessRate;

    return {
      newSafes,
      transactions,
      successRate: Math.round(successRate * 10) / 10,
      previousPeriodComparison: {
        safes: Math.round(safesChange * 10) / 10,
        transactions: Math.round(txChange * 10) / 10,
        successRate: Math.round(successRateChange * 10) / 10,
      }
    };
  }
}

export const storage = new MemStorage();
