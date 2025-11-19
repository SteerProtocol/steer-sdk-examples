import { createPublicClient, createWalletClient, http, Address } from 'viem';
import { avalanche, polygon } from 'viem/chains';
import { SteerClient } from '@steerprotocol/sdk';

/**
 * Steer Pool Pending Rewards Calculator
 * 
 * This module provides functionality to calculate pending rewards for users
 * from Steer Protocol vaults using the calculatePendingRewards method.
 */

export class SteerPendingRewardsCalculator {
  private steerClient: SteerClient;

  constructor(publicClient: any, walletClient: any, environment: 'development' | 'production' = 'production') {
    this.steerClient = new SteerClient({
      environment,
      client: publicClient,
      walletClient: walletClient
    });
  }

  /**
   * Prepare transaction object to claim user rewards from a vault
   * - Calls claimUserRewards() on the vault contract
   * - No args, nonpayable
   */
  async prepareClaimPendingRewardsTx(vaultAddress: Address) {
    const claimUserRewardsAbi = [
      {
        inputs: [],
        name: 'claimUserRewards',
        outputs: [
          { internalType: 'uint256', name: '', type: 'uint256' },
          { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ] as const;

    const preparedTx = {
      address: vaultAddress as `0x${string}`,
      abi: claimUserRewardsAbi,
      functionName: 'claimUserRewards' as const,
      args: [] as const
    };

    return preparedTx;
  }

  /**
   * Calculate pending rewards for a user from a specific vault
   */
  async calculatePendingRewards(
    vaultAddress: Address,
    userAddress: Address
  ): Promise<{ success: boolean; rewards?: bigint; extraRewards?: bigint; error?: string }> {
    try {
      console.log(`\n=== Calculating Pending Rewards ===`);
      console.log(`Vault Address: ${vaultAddress}`);
      console.log(`User Address: ${userAddress}`);

      const response = await this.steerClient.vaults.calculatePendingRewards({
        vaultAddress: vaultAddress as `0x${string}`,
        user: userAddress as `0x${string}`
      });

      if (response.success && response.data) {
        console.log(`✅ Pending rewards calculated successfully:`);
        console.log(`📊 Rewards: ${response.data.rewards.toString()}`);
        console.log(`📊 Extra Rewards: ${response.data.extraRewards.toString()}`);
        
        return {
          success: true,
          rewards: response.data.rewards,
          extraRewards: response.data.extraRewards
        };
      } else {
        console.log(`❌ Failed to calculate pending rewards`);
        return {
          success: false,
          error: 'Failed to calculate pending rewards'
        };
      }
    } catch (error) {
      console.error(`❌ Error calculating pending rewards:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

}

/**
 * Example usage and test function
 */
export async function runPendingRewardsExample(): Promise<void> {
  try {
    // Initialize clients
    const publicClient = createPublicClient({
      chain: avalanche,
      transport: http()
    });

    const walletClient = createWalletClient({
      chain: avalanche,
      transport: http()
    });

    // Create calculator instance
    const rewardsCalculator = new SteerPendingRewardsCalculator(publicClient, walletClient);

    // Test vault address (replace with actual vault address)
    const testVaultAddress = '0x616d4cAA488E8FC1215F9cd56e549a74432DC007' as Address;
    const userAddress = '0x8fcc82987Ba42b98d46F503Dd7235733fa45Ff5d' as Address;

    console.log('🚀 Starting Pending Rewards Calculation Example...');

    // Single vault calculation
    await rewardsCalculator.calculatePendingRewards(testVaultAddress, userAddress);


    console.log('\n✅ Pending rewards calculation example completed!');

  } catch (error) {
    console.error('❌ Error in pending rewards example:', error);
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runPendingRewardsExample().catch(console.error);
}
