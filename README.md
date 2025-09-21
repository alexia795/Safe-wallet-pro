# 🚀 Drain Safe (Single-Repo Safe App)

Drain Safe is a full-stack **Safe{Wallet} dApp** built entirely in **one Next.js repo**.  
It combines a modern React UI with secure backend logic using **Next.js API routes**,  
perfect for deployment on **Vercel**.

---

## ✨ Key Features
- **Single-Repo Architecture** → Frontend and backend live together in one Next.js project.
- **Safe SDK Integration** → Create, sign, and execute Safe transactions.
- **Serverless API Routes** → Secure backend logic without a separate server.
- **Environment Secrets** → Keep API keys & private keys hidden in Vercel.
- **Ready for Multi-Chain** → Connect to Ethereum, Arbitrum, Polygon, and more.
- **One-Click Vercel Deployment** → Automatic builds and serverless functions.

---

## 📂 Project Structure
```
drain-safe/
│
├─ pages/
│   ├─ index.tsx        # Safe App UI
│   └─ api/
│       └─ proposeTx.ts # Backend endpoint (serverless)
│
├─ package.json
├─ next.config.js
└─ .env.local.example   # Environment template
```

---

## ⚡️ Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/<alexia795>/drain-safe.git
cd drain-safe
npm install
```

### 2. Configure Environment
Create a file named **`.env.local`** at the project root:

```env
ALCHEMY_API_KEY=XuPZE3fUgxJ2AwDHYiSLzBVscOVcg9dy
SAFE_SIGNER_PRIVATE_KEY=0x867dcd58c9a16c5382dd1790df117b52635e4c6bfc115e157b2c4a024a4ef592
```

⚠️ **Do NOT prefix with `NEXT_PUBLIC_`** – these remain server-side only.

### 3. Run Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Available Scripts

| Command         | Description                                     |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Starts the app in development mode               |
| `npm run build` | Builds the production bundle                      |
| `npm start`     | Runs the production build                         |
| `npm run lint`  | Runs ESLint to check code quality                 |

---

## 🚀 Deployment (Vercel)

1. Push this repo to **GitHub**.
2. Go to [Vercel](https://vercel.com) → **New Project** → Import the repo.
3. Add the same environment variables (`ALCHEMY_API_KEY`, `SAFE_SIGNER_PRIVATE_KEY`)
   in **Project Settings → Environment Variables**.
4. Deploy!

Vercel automatically:
- Serves the frontend at `/`
- Exposes `/api/*` as secure backend endpoints

---

## 🔒 Security Tips
- Never commit `.env.local` to version control.
- Use different keys for staging and production.
- Rotate private keys regularly.

---

## 🛠 Tech Stack
- **Next.js 14** (React 18)
- **TypeScript**
- **@safe-global/safe-apps-react-sdk**
- **@safe-global/protocol-kit**
- **Vercel Serverless Functions**

---

### License
MIT

## 🚀 Deployment (Vercel)

1. Push this repo to **GitHub**.
2. Go to [Vercel](https://vercel.com) → **New Project** → Import the repo.
3. Add the same environment variables (`XuPZE3fUgxJ2AwDHYiSLzBVscOVcg9dy`, `0x867dcd58c9a16c5382dd1790df117b52635e4c6bfc115e157b2c4a024a4ef592`)
   in **Project Settings → Environment Variables**.
4. Deploy!

Vercel automatically:
- Serves the frontend at `/`
- Exposes `/api/*` as secure backend endpoints

### Example `vercel.json`

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
