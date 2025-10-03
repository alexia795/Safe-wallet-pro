# Safe Wallet Pro – Vercel Context

This document provides deployment context and configuration guidance for the **Safe Wallet Pro** project.  
It is intended for Vercel AI Agents, developers, and contributors to ensure proper setup and deployment.

---

## 📌 Project Overview
- **Name:** Safe Wallet Pro  
- **Type:** Safe{Wallet} integration + dApp (frontend + backend)  
- **Main Signer Address:** `0xFDf84a0e7D07bC56f7De56696fc409704cC83a24`  

- **Core SDKs:**
  - `@safe-global/protocol-kit`
  - `@safe-global/safe-core-sdk`
  - `ethers.js` or `viem`

- **Key Features:**
  - Safe transaction management
  - WalletConnect + Reown integration
  - Contract verification + Safe App manifest
  - Automated deployment from GitHub to Vercel

---

## 🚀 Deployment Guidelines

### Build & Output
- **Framework:** Next.js (or Vite if specified in `package.json`)  
- **Build Command:**
  ```bash
  npm run build
  ```
- **Output Directory:**
  - `.next` (for Next.js)
  - `dist` (for Vite)

---

### Environment Variables
Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

- `NEXT_PUBLIC_ALCHEMY_API_KEY` → RPC provider key (Alchemy, Infura, or custom)
- `NEXT_PUBLIC_SAFE_APP_URL` → deployed app URL
- `NEXT_PUBLIC_SIGNER_ADDRESS` → `0xFDf84a0e7D07bC56f7De56696fc409704cC83a24`

---

### Safe App Manifest
- The app manifest must be deployed at:  
  ```
  /public/safe-app.json
  ```

Example minimal `safe-app.json`:
```json
{
  "name": "Safe Wallet Pro",
  "description": "Safe{Wallet} integration dApp with contract verification",
  "iconPath": "logo.png",
  "safeAppsSdkVersion": "1.6.0",
  "accessControl": {
    "type": "domain",
    "value": "safe-wallet-pro.vercel.app"
  }
}
```

---

## ✅ Notes
- Always bump the version tag (`vX.Y.Z`) before publishing a release.  
- Ensure CI/CD workflows (GitHub Actions + Vercel) are kept in sync with these settings.  
- For local testing, also include `http://127.0.0.1/#` in your configuration.

---
