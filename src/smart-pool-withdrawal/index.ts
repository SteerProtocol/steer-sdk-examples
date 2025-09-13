/**
 * Smart Pool Withdrawal Module Entry Point
 * 
 * This module provides comprehensive Smart Pool withdrawal functionality
 * for the Steer Protocol SDK.
 */

import { SmartPoolWithdrawalExamples } from './smart-pool-withdrawal';

// Main functionality
export { SmartPoolWithdrawalManager, SmartPoolWithdrawalExamples, WithdrawalUtils } from './smart-pool-withdrawal';
export type { WithdrawalParams, WithdrawalResult, TokenAmountsResponse } from './smart-pool-withdrawal';
import {avalanche} from 'viem/chains';

// Test functionality

// Convenience functions
export async function runWithdrawalExamples(): Promise<void> {
  console.log('🚀 Running Smart Pool Withdrawal Examples...');
  const { createPublicClient, createWalletClient, http } = await import('viem');
  
  const publicClient = createPublicClient({
    chain: avalanche,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: avalanche,
    transport: http()
  });

  const examples = new SmartPoolWithdrawalExamples(publicClient, walletClient);
  await examples.withdrawalExample();
}


// Run the examples if this file is executed directly
if (require.main === module) {
  runWithdrawalExamples().catch(console.error);
}


