import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { safeAddress, to, amount } = req.body

  if (!safeAddress || !to || !amount) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  try {
    // 1. Load provider & signer using server-only env variables
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)
    const signer = new ethers.Wallet(process.env.SAFE_SIGNER_KEY!, provider)

    // 2. Initialize Safe SDK
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })
    const safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    })

    // 3. Create a Safe transaction
    const txData = {
      to,
      value: ethers.parseEther(amount).toString(),
      data: '0x'
    }
    const safeTransaction = await safeSdk.createTransaction({
      safeTransactionData: txData
    })

    // 4. Sign (backend signer adds its signature)
    const signedTx = await safeSdk.signTransaction(safeTransaction)

    // 5. (Optional) Propose to Safe Transaction Service here.
    // For example:
    // await fetch(`https://safe-transaction-mainnet.safe.global/api/v1/safes/${safeAddress}/multisig-transactions/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...signedTx.data,
    //     sender: signer.address
    //   })
    // })

    // 6. Return the signed transaction object
    return res.status(200).json({
      message: 'Transaction created and signed',
      signer: signer.address,
      safeTransaction: signedTx.data
    })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Transaction failed' })
  }
}
