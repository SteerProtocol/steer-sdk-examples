/**
 * Steer Pool Get Vaults Module Entry Point
 * 
 * This module provides comprehensive vault fetching functionality
 * for the Steer Protocol SDK with subgraph fallback support.
 */

import { ChainId, Protocol } from '@steerprotocol/sdk';
import { SteerVaultManager } from './smart-pool-get-vaults';

// Main functionality
export { SteerVaultManager } from './smart-pool-get-vaults';
export type { SupportedChainId } from './smart-pool-get-vaults';

// Convenience functions
export async function runGetVaultsExamples(): Promise<void> {
  console.log('🚀 Running Steer Pool Get Vaults Examples...');

  const vaultManager = new SteerVaultManager();
  
  // Example: Get all vaults for Avalanche
  console.log('📊 Fetching vaults for Avalanche...');
  try {
    const avalancheVaults = await vaultManager.getAllVaults({ 
      chainId: ChainId.Avalanche, 
      batchSize: 50,
      protocol: Protocol.Blackhole
    });
    console.log(`✅ Found ${avalancheVaults.data?.length} vaults on Avalanche`);
    
    if (avalancheVaults.data?.length > 0) {
      console.log('First vault:', avalancheVaults.data[0]);
    }
  } catch (error) {
    console.error('❌ Failed to fetch Avalanche vaults:', error);
  }

}

// Run the examples if this file is executed directly
if (require.main === module) {
  runGetVaultsExamples().catch(console.error);
}

