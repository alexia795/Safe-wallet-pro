import { useEffect, useState } from 'react'
import { Button, Typography, Box } from '@mui/material'
import SafeAppsSDK, { SafeInfo } from '@safe-global/safe-apps-sdk'

export default function Home() {
  const [safe, setSafe] = useState<SafeInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sdk = new SafeAppsSDK()
    sdk.safe
      .getInfo()
      .then((info) => setSafe(info))
      .catch(() => setError('Not running inside a Safe App container.'))
  }, [])

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Drain-Safe Starter
      </Typography>

      {safe ? (
        <>
          <Typography>Connected Safe:</Typography>
          <Typography variant="body1">{safe.safeAddress}</Typography>
          <Typography variant="body2">Chain ID: {safe.chainId}</Typography>
        </>
      ) : (
        <>
          <Typography variant="body1" gutterBottom>
            {error ?? 'Detecting Safe environment…'}
          </Typography>
          <Button
            variant="contained"
            onClick={() =>
              window.open('https://app.safe.global', '_blank', 'noopener,noreferrer')
            }
          >
            Open Safe App
          </Button>
        </>
      )}
    </Box>
  )
}
