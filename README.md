# 🚀 Safe {wallet} pro (Single-Repo Safe App)

Safe Wallet Pro is a comprehensive multi-signature cryptocurrency wallet management application built with React and Express. The application provides a secure interface for managing Safe{Wallet} multi-signature wallets, including transaction proposals, asset management, signer administration, and real-time updates through WebSocket connections. It integrates with WalletConnect for wallet connectivity and supports multiple blockchain networks.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with WebSocket support for real-time updates
- **Authentication**: Basic admin authentication middleware with header-based access control
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive multi-signature wallet schema including safes, owners, transactions, confirmations, and assets
- **Migrations**: Drizzle Kit for database schema migrations and management

## Core Data Models
- **Safes**: Multi-signature wallet containers with threshold and chain information
- **Safe Owners**: Addresses authorized to sign transactions for a specific safe
- **Transactions**: Proposed and executed transactions with confirmation tracking
- **Confirmations**: Individual owner approvals for pending transactions
- **Assets**: Token balances and metadata for safe wallets

## Real-time Communication
- **WebSocket Server**: Built-in WebSocket support for live updates of transaction status, approvals, and system events
- **Event Broadcasting**: Real-time notifications to all connected clients for transaction state changes

## Security Features
- **Multi-signature Support**: Configurable threshold-based transaction approval system
- **Admin Controls**: Protected admin endpoints for system monitoring and management
- **Wallet Integration**: WalletConnect v2 integration for secure wallet connectivity
- **Safe Integration**: Safe{Core} SDK integration for interacting with Safe smart contracts

## Development Tools
- **Build System**: Vite with React plugin for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
- **Development Experience**: Hot module replacement, runtime error overlay, and development banners for Replit environment

# External Dependencies

## Blockchain Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **WalletConnect**: Decentralized protocol for connecting wallets to dApps
- **Safe Global**: Safe{Core} SDK for multi-signature wallet operations
- **RPC Providers**: Alchemy and other RPC endpoints for blockchain interaction

## UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives for building design systems
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Beautiful, customizable SVG icons
- **shadcn/ui**: Pre-built, customizable component library

## Development and Build Tools
- **Replit Integration**: Specialized plugins for Replit development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

## Blockchain Networks
- **Ethereum Mainnet**: Primary blockchain network support
- **Arbitrum**: Layer 2 scaling solution support
- **Polygon**: Alternative blockchain network support
- **Multi-chain Architecture**: Configurable support for additional EVM-compatible networks
