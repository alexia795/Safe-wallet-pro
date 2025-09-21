import { useEffect, useState } from 'react'
import { Button, Typography, Box } from '@mui/material'
import SafeAppsSDK, { SafeInfo } from '@safe-global/safe-apps-sdk'
import { ethers } from 'ethers'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'

export default function Home() {
  const [safeInfo, setSafeInfo] = useState<SafeInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    const sdk = new SafeAppsSDK()
    sdk.safe
      .getInfo()
      .then(setSafeInfo)
      .catch(() => setError('Not running inside a Safe App container.'))
  }, [])

  async function sendTransaction() {
    if (!safeInfo) return
    setLoading(true)
    try {
      // 1. Provider (uses the same chain as the Safe)
      const provider = new ethers.JsonRpcProvider(
        // Replace with a real RPC (Alchemy/Infura) for the chain your Safe is on
        'https://eth-mainnet.g.alchemy.com/v2/XuPZE3fUgxJ2AwDHYiSLzBVscOVcg9dy
      )

      // 2. Signer (for demo use a burner—replace in production!)
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY || '',
        provider
      )

      // 3. Load the Safe instance
      const safeSdk = await Safe.create({
        ethAdapter: new Safe.EthersAdapter({ ethers, signerOrProvider: signer }),
        safeAddress: safeInfo.safeAddress
      })

      // 4. Build a transaction (sending 0.0001 ETH to yourself)
      const txData = {
        to: safeInfo.safeAddress,
        value: ethers.parseEther('0.0001').toString(),
        data: '0x'
      }

      const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData })

      // 5. Sign the transaction
      const signedTx = await safeSdk.signTransaction(safeTransaction)

      // 6. Propose/execute transaction
      //   - In production, you typically propose to the Safe Transaction Service.
      //   - Here, we try direct execution if signer is threshold owner.
      const txResponse = await safeSdk.executeTransaction(signedTx)

      setTxHash(txResponse.hash)
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Drain-Safe Starter
      </Typography>

      {safeInfo ? (
        <>
          <Typography>Connected Safe:</Typography>
          <Typography variant="body1">{safeInfo.safeAddress}</Typography>
          <Typography variant="body2">Chain ID: {safeInfo.chainId}</Typography>

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={sendTransaction}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send Test Transaction'}
          </Button>

          {txHash && (
            <Typography sx={{ mt: 2 }}>
              Tx Hash: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">{txHash}</a>
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="body1" gutterBottom>
          {error ?? 'Detecting Safe environment…'}
        </Typography>
      )}
    </Box>
  )
}
