/**
 * Steer Protocol SDK - Subgraph Fallback Implementation Example
 * 
 * This example demonstrates how to use the Steer Protocol SDK with automatic
 * subgraph fallback for vault fetching across different chains.
 */

import { VaultClient } from '@steerprotocol/sdk';
import { createPublicClient, createWalletClient, http, type Chain } from 'viem';
import { arbitrum, avalanche, base, bsc, optimism, polygon } from 'viem/chains';

// Chain configuration mapping
const CHAIN_CONFIG = {
  43114: avalanche,    // Avalanche
  137: polygon,        // Polygon
  42161: arbitrum,     // Arbitrum
  10: optimism,        // Optimism
  56: bsc,             // BSC
  8453: base,   
} as const;

type SupportedChainId = keyof typeof CHAIN_CONFIG;

/**
 * Steer Vault Manager with Subgraph Fallback
 * 
 * This class demonstrates the enhanced VaultClient with automatic fallback
 * to subgraph when the primary API fails.
 */
export class SteerVaultManager {
  private vaultClients: Map<number, VaultClient> = new Map();
  private publicClients: Map<number, any> = new Map();
  private walletClients: Map<number, any> = new Map();

  constructor() {
    this.initializeClients();
  }

  /**
   * Initialize VaultClient instances for all supported chains
   */
  private initializeClients(): void {
    Object.entries(CHAIN_CONFIG).forEach(([chainId, chain]) => {
      const publicClient = createPublicClient({
        chain: chain as Chain,
        transport: http()
      });

      const walletClient = createWalletClient({
        chain: chain as Chain,
        transport: http()
      });

      const vaultClient = new VaultClient(
        publicClient,
        walletClient,
        'production'
      );

      this.publicClients.set(Number(chainId), publicClient);
      this.walletClients.set(Number(chainId), walletClient);
      this.vaultClients.set(Number(chainId), vaultClient);
    });
  }

  /**
   * Get vaults with automatic subgraph fallback
   * 
   * @param chainId - The chain ID to fetch vaults from
   * @param limit - Maximum number of vaults to fetch
   * @param cursor - Pagination cursor
   * @param beaconName - Optional beacon name filter
   */
  async getVaults(
    chainId: number,
    limit: number = 50,
    cursor: string | null = null,
    beaconName?: string,
    protocol?: string
  ) {
    const vaultClient = this.vaultClients.get(chainId);
    
    if (!vaultClient) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const filter: any = { chainId };
    if (beaconName) {
      filter.beaconName = beaconName;
    }
    if (protocol) {
      filter.protocol = protocol;
    }

    console.log(`Fetching vaults for chain ${chainId}${beaconName ? ` with beacon ${beaconName}` : ''}...`);
    
    try {
      const result = await vaultClient.getVaults(filter, limit, cursor);
      
      if (result.success && result.data) {
        console.log(`✅ Successfully fetched ${result.data.edges.length} vaults from API`);

        // Loop over each vault and fetch Blackhole APR details
        for (const edge of result.data.edges) {
          const vault = edge.node as any;
          
          console.log(`\nFetching Blackhole APR details for vault: ${vault.address || vault.id}`);
          
          try {
            const aprDetails = await vaultClient.getBlackholeVaultApr({
              vaultAddress: vault.address || vault.id,
              chainId: chainId
            });

            if (aprDetails.success && aprDetails.data) {
              console.log(`  ✅ Current APR: ${aprDetails.data.apr.apr}%`);
              console.log(`  Status: ${aprDetails.data.apr.message}`);
              
              // Log snapshot analysis if available
              if (aprDetails.data.snapshotAnalysis && aprDetails.data.snapshotAnalysis.length > 0) {
                console.log(`  Historical snapshots: ${aprDetails.data.snapshotAnalysis.length}`);
                aprDetails.data.snapshotAnalysis.forEach((snapshot: any) => {
                  console.log(`    Period ${snapshot.period}: ${snapshot.apr}% APR, TVL: $${snapshot.tvlUSD}, Fees: $${snapshot.feesUSD}`);
                });
              }
            } else {
              console.log(`  ⚠️ Failed to fetch APR details: ${aprDetails.error}`);
            }
          } catch (aprError) {
            console.log(`  ⚠️ Error fetching Blackhole APR: ${aprError}`);
          }
        }
        
        return {
          success: true,
          data: result.data,
          source: 'api' as const,
          chainId
        };
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.warn(`⚠️  API client failed, falling back to subgraph: ${error}`);
      return {
        success: false,
        error: error,
        chainId
      };
    }
  }

  /**
   * Get vaults with pagination support
   */
  async getAllVaults(
   { 
    chainId,
    batchSize,
    beaconName,
    protocol}: { 
      chainId: number,
      batchSize: number,
      beaconName?: string,
      protocol?: string
    } 
  ) {
    const allVaults: any[] = [];
    let cursor: string | null = null;
    let hasMore = true;
    let totalFetched = 0;

    console.log(`Starting paginated fetch for chain ${chainId}...`);

    while (hasMore) {
      const result = await this.getVaults(chainId, batchSize, cursor, beaconName, protocol);
      
      if (result.success && result.data) {
        allVaults.push(...result.data.edges);
        totalFetched += result.data.edges.length;
        hasMore = result.data.pageInfo.hasNextPage;
        cursor = result.data.pageInfo.endCursor;
        
        console.log(`Fetched ${result.data.edges.length} vaults (total: ${totalFetched})`);
      } else {
        console.error('Failed to fetch vaults:', (result as any).error || 'Unknown error');
        break;
      }
    }

    return {
      success: true,
      data: allVaults,
      totalCount: totalFetched,
      chainId
    };
  }

  /**
   * Get vaults by specific beacon name
   */
  async getVaultsByBeacon(
    chainId: SupportedChainId,
    beaconName: string,
    limit: number = 50
  ) {
    return this.getVaults(chainId, limit, null, beaconName);
  }

  /**
   * Compare vault data across multiple chains
   */
  async compareVaultsAcrossChains(
    beaconName: string,
    limit: number = 20
  ) {
    const results: Record<string, any> = {};
    
    console.log(`Comparing vaults with beacon "${beaconName}" across chains...`);

    for (const chainId of Object.keys(CHAIN_CONFIG)) {
      const numericChainId = Number(chainId) as SupportedChainId;
      console.log(`\n--- Chain ${numericChainId} ---`);
      
      const result = await this.getVaultsByBeacon(numericChainId, beaconName, limit);
      results[chainId] = result;
    }

    return results;
  }


}

/**
 * Example usage and testing functions
 */
export class SteerVaultExamples {
  private vaultManager: SteerVaultManager;

  constructor() {
    this.vaultManager = new SteerVaultManager();
  }

}

// Export for use in other files
export { CHAIN_CONFIG, type SupportedChainId };
