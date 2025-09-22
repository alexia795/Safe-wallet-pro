"use client"

import { useState, useEffect } from "react"
import { createSafeSDK, type SafeInfo, type SafeBalance, type SafeTransaction } from "@/lib/safe-sdk"
import type { SupportedNetwork } from "@/lib/safe-config"

export function useSafe(network: SupportedNetwork = "ETHEREUM") {
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null)
  const [balances, setBalances] = useState<SafeBalance[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<SafeTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const safeSDK = createSafeSDK(network)

  const loadSafeData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [info, balanceData, pendingTxs] = await Promise.all([
        safeSDK.getSafeInfo(),
        safeSDK.getBalances(),
        safeSDK.getPendingTransactions(),
      ])

      setSafeInfo(info)
      setBalances(balanceData)
      setPendingTransactions(pendingTxs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Safe data")
    } finally {
      setLoading(false)
    }
  }

  const proposeTransaction = async (transaction: {
    to: string
    value: string
    data: string
  }) => {
    try {
      const txHash = await safeSDK.proposeTransaction(transaction)
      // Reload pending transactions
      const pendingTxs = await safeSDK.getPendingTransactions()
      setPendingTransactions(pendingTxs)
      return txHash
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to propose transaction")
    }
  }

  const confirmTransaction = async (safeTxHash: string) => {
    try {
      await safeSDK.confirmTransaction(safeTxHash)
      // Reload pending transactions
      const pendingTxs = await safeSDK.getPendingTransactions()
      setPendingTransactions(pendingTxs)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to confirm transaction")
    }
  }

  const executeTransaction = async (safeTxHash: string) => {
    try {
      const txHash = await safeSDK.executeTransaction(safeTxHash)
      // Reload all data after execution
      await loadSafeData()
      return txHash
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to execute transaction")
    }
  }

  useEffect(() => {
    loadSafeData()
  }, [network])

  return {
    safeInfo,
    balances,
    pendingTransactions,
    loading,
    error,
    proposeTransaction,
    confirmTransaction,
    executeTransaction,
    refresh: loadSafeData,
  }
}
