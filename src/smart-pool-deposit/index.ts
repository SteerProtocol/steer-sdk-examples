/**
 * Smart Pool Deposit Module Entry Point
 * 
 * This module provides comprehensive Smart Pool deposit functionality
 * for the Steer Protocol SDK.
 */

import { SmartPoolDepositExamples } from './smart-pool-deposit';
import {avalanche} from 'viem/chains';

// Main functionality
export { SmartPoolDepositManager, SmartPoolDepositExamples, DepositUtils } from './smart-pool-deposit';
export type { DepositParams, DepositResult, TokenInfo, VaultInfo } from './smart-pool-deposit';

// Test functionality

// Convenience functions
export async function runDepositExamples(): Promise<void> {
  console.log('🚀 Running Smart Pool Deposit Examples...');
  const { createPublicClient, createWalletClient, http } = await import('viem');
  
  const publicClient = createPublicClient({
    chain: avalanche,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: avalanche,
    transport: http()
  });

  const examples = new SmartPoolDepositExamples(publicClient, walletClient);
  await examples.depositExample();
}


// Run the examples if this file is executed directly
if (require.main === module) {
  runDepositExamples().catch(console.error);
}


