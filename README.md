# SDK Examples - Steer Protocol

This repository contains comprehensive examples and utilities for the Steer Protocol SDK, organized into modular folders for easy navigation and usage. Built with TypeScript and modern Ethereum development tools including viem and wagmi.

## Project Structure

```
src/
├── index.ts                           # Main entry point with all exports
├── smart-pool-deposit/               # Smart Pool Deposit Module
│   ├── index.ts                      # Module entry point
│   ├── smart-pool-deposit.ts         # Core deposit functionality
│   └── test-smart-pool-deposit.ts    # Deposit tests and utilities
├── smart-pool-withdrawal/            # Smart Pool Withdrawal Module
│   ├── index.ts                      # Module entry point
│   ├── smart-pool-withdrawal.ts      # Core withdrawal functionality
│   └── test-smart-pool-withdrawal.ts # Withdrawal tests and utilities
├── steer-pool-get-vaults/            # Vault Fetching Module
│   ├── index.ts                      # Module entry point
│   └── smart-pool-get-vaults.ts      # Vault fetching with subgraph fallback
├── steer-pool-pending-rewards/       # Pending Rewards Module
│   └── index.ts                      # Pending rewards calculation
├── utils.ts                          # Shared utility functions
├── steer-config.ts                   # Steer Protocol configuration
├── steer-types.ts                    # Type definitions
└── test-subgraph-fallback.ts         # Subgraph fallback tests
```

## Available Modules

### 📁 Smart Pool Deposit (`smart-pool-deposit/`)

Complete functionality for depositing assets into Steer Protocol Smart Pools.

**Features:**
- Deposit transaction preparation and execution
- Token approval management
- Optimal deposit amount calculations
- Comprehensive error handling
- Batch deposit operations
- Performance testing utilities

**Usage:**
```typescript
import { SmartPoolDepositManager, runDepositExamples } from './smart-pool-deposit';

// Run examples
await runDepositExamples();

// Use manager directly
const depositManager = new SmartPoolDepositManager(publicClient, walletClient);
const result = await depositManager.deposit({
  vaultAddress: '0x...',
  amount0Desired: parseUnits('100', 6),
  amount1Desired: parseUnits('100', 6),
  slippage: 0.01
});
```

### 📁 Smart Pool Withdrawal (`smart-pool-withdrawal/`)

Complete functionality for withdrawing assets from Steer Protocol Smart Pools.

**Features:**
- Withdrawal transaction preparation and execution
- LP token balance validation
- Token amount calculations from LP tokens
- Slippage protection
- Custom recipient support
- Batch withdrawal operations
- Performance testing utilities

**Usage:**
```typescript
import { SmartPoolWithdrawalManager, runWithdrawalExamples } from './smart-pool-withdrawal';

// Run examples
await runWithdrawalExamples();

// Use manager directly
const withdrawalManager = new SmartPoolWithdrawalManager(publicClient, walletClient);
const result = await withdrawalManager.withdraw({
  vaultAddress: '0x...',
  shares: parseUnits('1', 18),
  amount0Min: BigInt('990000'),
  amount1Min: BigInt('990000')
});
```

### 📁 Steer Pool Get Vaults (`steer-pool-get-vaults/`)

Advanced vault fetching with automatic subgraph fallback support.

**Features:**
- Multi-chain vault fetching
- Automatic subgraph fallback
- Beacon name filtering
- Performance optimization
- Error handling and retry logic

**Usage:**
```typescript
import { SteerVaultManager, runGetVaultsExamples } from './steer-pool-get-vaults';

// Run examples
await runGetVaultsExamples();

// Use manager directly
const vaultManager = new SteerVaultManager();
const vaults = await vaultManager.getAllVaults(137, 10); // Polygon, limit 10
```

### 📁 Steer Pool Pending Rewards (`steer-pool-pending-rewards/`)

Calculate pending rewards for users from Steer Protocol vaults.

**Features:**
- Single vault reward calculation
- Multiple vault batch processing
- Comprehensive error handling
- Detailed logging and reporting
- Support for both regular and extra rewards

**Usage:**
```typescript
import { SteerPendingRewardsCalculator, runPendingRewardsExample } from './steer-pool-pending-rewards';

// Run examples
await runPendingRewardsExample();

// Use calculator directly
const rewardsCalculator = new SteerPendingRewardsCalculator(publicClient, walletClient);
const result = await rewardsCalculator.calculatePendingRewards(vaultAddress, userAddress);
```

## Available Scripts

### Development
- `yarn build` - Build TypeScript to JavaScript
- `yarn dev` - Build TypeScript in watch mode
- `yarn start` - Run the built application
- `yarn lint` - Run ESLint on TypeScript files
- `yarn clean` - Clean build directory

### Examples
- `yarn example:deposit` - Run deposit examples
- `yarn example:withdrawal` - Run withdrawal examples  
- `yarn example:vaults` - Run vault fetching examples
- `yarn example:blackhole-rewards` - Run pending rewards calculation examples

## Dependencies

### Core Dependencies
- **@steerprotocol/sdk** (1.21.0-test-blackhole-support.5) - Steer Protocol SDK with blackhole support
- **viem** (^2.0.0) - TypeScript interface for Ethereum
- **wagmi** (^2.0.0) - React hooks for Ethereum
- **@uniswap/sdk-core** (^7.7.2) - Uniswap SDK core utilities
- **@uniswap/v3-sdk** (^3.25.2) - Uniswap V3 SDK
- **axios** (^1.6.0) - HTTP client for API requests
- **reflect-metadata** (^0.1.13) - Metadata reflection API

### Development Dependencies
- **TypeScript** (^5.0.0) - TypeScript compiler
- **ts-node** (^10.9.0) - TypeScript execution for Node.js
- **tsconfig-paths** (^4.2.0) - TypeScript path mapping
- **ESLint** (^8.0.0) - Code linting
- **Jest** (^29.0.0) - Testing framework
- **ts-jest** (^29.0.0) - TypeScript preprocessor for Jest

## Installation

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Run examples
yarn example:deposit
yarn example:withdrawal
yarn example:vaults
yarn example:blackhole-rewards
```

## Supported Chains

The vault fetching module supports the following chains:
- **Polygon** (137)
- **Avalanche** (43114)
- **Arbitrum** (42161)
- **Optimism** (10)
- **BSC** (56)
- **Base** (8453)

## Key Features

### 🔒 Security
- Comprehensive input validation
- Slippage protection
- Error handling and recovery
- Transaction confirmation waiting

### 🚀 Performance
- Optimized batch operations
- Efficient token amount calculations
- Performance testing utilities
- Memory-efficient implementations

### 🛠️ Developer Experience
- TypeScript support with full type definitions
- Comprehensive error messages
- Modular architecture
- Extensive examples and tests

### 🔄 Reliability
- Automatic retry mechanisms
- Subgraph fallback support
- Graceful error handling
- Transaction status monitoring

## Contributing

1. Follow the existing folder structure
2. Add comprehensive tests for new functionality
3. Update this README for new modules
4. Ensure TypeScript compilation passes
5. Add performance tests for critical paths

## License

MIT License - see LICENSE file for details.# steer-sdk-examples
