# Safe Wallet Pro – Vercel Context

This document provides context and deployment guidance for the **Safe Wallet Pro** project.  
It is used by Vercel AI Agents, developers, and contributors to ensure correct configuration and deployment.

---

## 📌 Project Overview
- **Name:** Safe Wallet Pro  
- **Type:** Safe{Wallet} integration + DApp (frontend + backend)  
- **Main Signer Address:** `0xFDf84a0e7D07bC56f7De56696fc409704cC83a24`  
- **Core SDKs:**  
  - `@safe-global/protocol-kit`  
  - `@safe-global/safe-core-sdk`  
  - `ethers.js` or `viem`  
- **Features:**  
  - Safe transaction management  
  - WalletConnect + Reown integration  
  - Contract verification + Safe App manifest  
  - Vercel auto-deployment from GitHub  

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

### Environment Variables
Set in **Vercel Dashboard → Project → Settings → Environment Variables**:  
- `NEXT_PUBLIC_ALCHEMY_API_KEY` (or Infura/other RPC provider)  
- `NEXT_PUBLIC_SAFE_APP_URL` → your deployed app URL  
- `NEXT_PUBLIC_SIGNER_ADDRESS` → `0xFDf84a0e7D07bC56f7De56696fc409704cC83a24`  

---

## 🔑 Safe App Manifest
The app manifest is deployed at `/public/safe-app.json`.  
It must include:  
```json
{
  "name": "Safe Wallet Pro",
  "description": "A Safe{Wallet}-powered application with automation, WalletConnect, and verified signer support.",
  "iconPath": "logo.png",
  "safeAppsSdkVersion": "1.0.0",
  "appUrl": "https://<your-vercel-url>"
}
```

---

## 🤖 Agent & Contributor Notes
- Always respect **real signer configuration** (`0xFDf84...3a24`).  
- Do not add placeholders in config or manifests.  
- Ensure **Vercel previews** match the production Safe App requirements.  
- Follow GitHub Actions setup for auto-deployment (`.github/workflows/vercel.yml`).  

---

## ✅ Verification Checklist
- [ ] `vercel build` succeeds locally  
- [ ] Safe App manifest resolves at `/safe-app.json`  
- [ ] Contracts verified on Etherscan (or Blockscout for other networks)  
- [ ] Deployed site loads inside Safe{Wallet}  
