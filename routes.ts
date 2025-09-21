import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSafeSchema, insertTransactionSchema, insertConfirmationSchema } from "@shared/schema";
import { z } from "zod";

// Basic admin authentication middleware
function requireAdminAuth(req: any, res: any, next: any) {
  // For demo purposes, check for a simple header or env flag
  // In production, this would be proper session/JWT validation
  const adminKey = req.headers['x-admin-key'] || process.env.ADMIN_KEY;
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && (!adminKey || adminKey !== 'safe-admin-key-2024')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
}

// Validation schemas for admin endpoints
const timeframeSchema = z.enum(['24h', '7d', '30d', '90d']);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Safe routes
  app.get("/api/safes", async (_req, res) => {
    try {
      const safes = await storage.getAllSafes();
      res.json(safes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safes" });
    }
  });

  app.get("/api/safes/:address/:chainId", async (req, res) => {
    try {
      const { address, chainId } = req.params;
      const safe = await storage.getSafeByAddress(address, parseInt(chainId));
      
      if (!safe) {
        return res.status(404).json({ message: "Safe not found" });
      }

      res.json(safe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe" });
    }
  });

  app.post("/api/safes", async (req, res) => {
    try {
      const safeData = insertSafeSchema.parse(req.body);
      const safe = await storage.createSafe(safeData);
      
      broadcast({ type: 'SAFE_CREATED', data: safe });
      res.status(201).json(safe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid safe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create safe" });
    }
  });

  // Safe owners routes
  app.get("/api/safes/:safeId/owners", async (req, res) => {
    try {
      const owners = await storage.getSafeOwners(req.params.safeId);
      res.json(owners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe owners" });
    }
  });

  // Transaction routes
  app.get("/api/safes/:safeId/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getSafeTransactions(req.params.safeId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/safes/:safeId/transactions/pending", async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions(req.params.safeId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      broadcast({ type: 'TRANSACTION_CREATED', data: transaction });
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const transaction = await storage.updateTransaction(req.params.id, updates);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      broadcast({ type: 'TRANSACTION_UPDATED', data: transaction });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Confirmation routes
  app.get("/api/transactions/:transactionId/confirmations", async (req, res) => {
    try {
      const confirmations = await storage.getConfirmations(req.params.transactionId);
      res.json(confirmations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch confirmations" });
    }
  });

  app.post("/api/confirmations", async (req, res) => {
    try {
      const confirmationData = insertConfirmationSchema.parse(req.body);
      const confirmation = await storage.addConfirmation(confirmationData);
      
      // Update transaction confirmation count
      const confirmations = await storage.getConfirmations(confirmationData.transactionId);
      await storage.updateTransaction(confirmationData.transactionId, {
        confirmations: confirmations.length
      });

      broadcast({ type: 'CONFIRMATION_ADDED', data: { confirmation, transactionId: confirmationData.transactionId } });
      res.status(201).json(confirmation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid confirmation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add confirmation" });
    }
  });

  // Asset routes
  app.get("/api/safes/:safeId/assets", async (req, res) => {
    try {
      const assets = await storage.getSafeAssets(req.params.safeId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/overview", requireAdminAuth, async (_req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system overview" });
    }
  });

  app.get("/api/admin/safes", requireAdminAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const safes = await storage.getRecentSafes(limit);
      
      // Enhance safes with owner count and balance information
      const enhancedSafes = await Promise.all(
        safes.map(async (safe) => {
          const owners = await storage.getSafeOwners(safe.id);
          const assets = await storage.getSafeAssets(safe.id);
          const totalBalance = assets.reduce((sum, asset) => sum + (asset.balanceUsd || 0), 0);
          
          return {
            ...safe,
            ownersCount: owners.length,
            threshold: safe.threshold || owners.length, // Default to all owners if no threshold set
            totalBalance,
            status: 'active' // Mock status for now
          };
        })
      );
      
      res.json(enhancedSafes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safes" });
    }
  });

  app.get("/api/admin/alerts", requireAdminAuth, async (_req, res) => {
    try {
      const alerts = await storage.getSystemAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system alerts" });
    }
  });

  app.get("/api/admin/analytics", requireAdminAuth, async (req, res) => {
    try {
      const timeframeParam = req.query.timeframe as string;
      const validationResult = timeframeSchema.safeParse(timeframeParam);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid timeframe parameter. Must be one of: 24h, 7d, 30d, 90d",
          provided: timeframeParam
        });
      }
      
      const timeframe = validationResult.data;
      const analytics = await storage.getAnalytics(timeframe);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // System maintenance endpoints (protected)
  app.post("/api/admin/maintenance/backup", requireAdminAuth, async (_req, res) => {
    try {
      // Mock backup operation
      const timestamp = new Date().toISOString();
      res.json({ 
        success: true, 
        message: "Database backup completed successfully",
        timestamp,
        filename: `safe-wallet-backup-${timestamp.replace(/[:.]/g, '-')}.sql`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to backup database" });
    }
  });

  app.post("/api/admin/maintenance/optimize", requireAdminAuth, async (_req, res) => {
    try {
      // Mock database optimization
      res.json({ 
        success: true, 
        message: "Database optimization completed successfully",
        optimizationsApplied: ["Rebuilt indexes", "Updated statistics", "Cleaned up logs"],
        spaceSaved: "124.5 MB"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to optimize database" });
    }
  });

  app.post("/api/admin/maintenance/clear-cache", requireAdminAuth, async (_req, res) => {
    try {
      // Mock cache clearing
      res.json({ 
        success: true, 
        message: "Application cache cleared successfully",
        cacheSize: "45.2 MB"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  return httpServer;
}
