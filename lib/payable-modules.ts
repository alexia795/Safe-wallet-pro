// Payable modules configuration and utilities
export interface PayableModule {
  id: string
  name: string
  description: string
  address: string
  enabled: boolean
  version: string
  permissions: string[]
}

export interface RecurringPayment {
  id: string
  recipient: string
  amount: string
  token: string
  interval: number // seconds
  nextExecution: string
  totalExecutions: number
  executedCount: number
  isActive: boolean
  description: string
  createdAt: string
}

export interface Allowance {
  id: string
  spender: string
  token: string
  amount: string
  spent: string
  expiresAt: string
  isActive: boolean
  description: string
  createdAt: string
}

export interface PaymentStream {
  id: string
  recipient: string
  token: string
  totalAmount: string
  streamedAmount: string
  startTime: string
  endTime: string
  isActive: boolean
  description: string
  createdAt: string
}

// Mock payable modules for demo
export const AVAILABLE_MODULES: PayableModule[] = [
  {
    id: "recurring-payments",
    name: "Recurring Payments",
    description: "Automate regular payments to recipients",
    address: "0x1234567890123456789012345678901234567890",
    enabled: true,
    version: "1.0.0",
    permissions: ["EXECUTE_TRANSACTIONS", "SCHEDULE_PAYMENTS"],
  },
  {
    id: "allowances",
    name: "Spending Allowances",
    description: "Set spending limits for addresses",
    address: "0x2345678901234567890123456789012345678901",
    enabled: true,
    version: "1.0.0",
    permissions: ["MANAGE_ALLOWANCES", "TRACK_SPENDING"],
  },
  {
    id: "payment-streams",
    name: "Payment Streaming",
    description: "Stream payments over time",
    address: "0x3456789012345678901234567890123456789012",
    enabled: false,
    version: "1.0.0",
    permissions: ["STREAM_PAYMENTS", "MANAGE_STREAMS"],
  },
  {
    id: "subscription-manager",
    name: "Subscription Manager",
    description: "Manage subscription payments",
    address: "0x4567890123456789012345678901234567890123",
    enabled: false,
    version: "1.0.0",
    permissions: ["MANAGE_SUBSCRIPTIONS", "EXECUTE_PAYMENTS"],
  },
]

// Mock data for demo
export const MOCK_RECURRING_PAYMENTS: RecurringPayment[] = [
  {
    id: "1",
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    amount: "1000000000000000000", // 1 ETH
    token: "ETH",
    interval: 2592000, // 30 days
    nextExecution: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    totalExecutions: 12,
    executedCount: 3,
    isActive: true,
    description: "Monthly salary payment",
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: "2",
    recipient: "0x8ba1f109551bD432803012645Hac136c22C57592",
    amount: "500000000", // 500 USDC
    token: "USDC",
    interval: 604800, // 7 days
    nextExecution: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    totalExecutions: 52,
    executedCount: 8,
    isActive: true,
    description: "Weekly contractor payment",
    createdAt: new Date(Date.now() - 86400000 * 56).toISOString(),
  },
]

export const MOCK_ALLOWANCES: Allowance[] = [
  {
    id: "1",
    spender: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token: "USDC",
    amount: "10000000000", // 10,000 USDC
    spent: "2500000000", // 2,500 USDC
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    isActive: true,
    description: "Marketing budget allowance",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "2",
    spender: "0x8ba1f109551bD432803012645Hac136c22C57592",
    token: "ETH",
    amount: "5000000000000000000", // 5 ETH
    spent: "1200000000000000000", // 1.2 ETH
    expiresAt: new Date(Date.now() + 86400000 * 60).toISOString(), // 60 days from now
    isActive: true,
    description: "Development expenses",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]

export const MOCK_PAYMENT_STREAMS: PaymentStream[] = [
  {
    id: "1",
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token: "USDC",
    totalAmount: "12000000000", // 12,000 USDC
    streamedAmount: "4000000000", // 4,000 USDC
    startTime: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    endTime: new Date(Date.now() + 86400000 * 60).toISOString(), // 60 days from now
    isActive: true,
    description: "3-month project payment stream",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]
