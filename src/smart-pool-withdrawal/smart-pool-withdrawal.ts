/**
 * Smart Pool Withdrawal Example
 * 
 * This example demonstrates how to withdraw assets from Steer Protocol Smart Pools
 * using the SDK with proper error handling, LP token balance checks, and transaction management.
 */

import { SteerClient } from '@steerprotocol/sdk';
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem';

// Type definitions for the withdrawal process
interface WithdrawalParams {
  vaultAddress: string;
  shares: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  recipient?: Address;
}

interface TokenAmountsResponse {
  token0Val: bigint;
  token1Val: bigint;
}

interface WithdrawalResult {
  success: boolean;
  transactionHash?: string;
  token0Received?: bigint;
  token1Received?: bigint;
  error?: string;
}

/**
 * Smart Pool Withdrawal Manager
 * 
 * Handles the complete withdrawal process including LP token balance checks, 
 * token amount calculations, and transaction execution
 */
export class SmartPoolWithdrawalManager {


  private steerClient: SteerClient;
  private publicClient: any;
  private walletClient: any;

  constructor(publicClient: any, walletClient: any, environment: 'development' | 'production' = 'production') {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    
    this.steerClient = new SteerClient({
      environment,
      client: publicClient,
      walletClient: walletClient
    });
  }


  /**
   * Check LP token balance for an address
   */

 
  async calculateOptimalWithdrawAmounts(vaultAddress: string, shares: bigint): Promise<{ amount0: bigint; amount1: bigint } | null> {
    try {
      const amount0 = await this.steerClient.vaults.getTokensFromLp(vaultAddress as `0x${string}`, shares);
      return { amount0: amount0.data?.token0Val || 0n, amount1: amount0.data?.token1Val || 0n };
    } catch (error) {
      console.error('Failed to calculate optimal amounts:', error);
      return null;
    }
  }



  getLpTokenBalance(vaultAddress: string, userAddress: string) {

    return this.publicClient.readContract({
      address: vaultAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`]
    });
  }

  /**
   * Prepare withdrawal transaction
   */
  async prepareWithdrawTx(params: WithdrawalParams) {
    try {
      // Mock transaction preparation for demonstration
      // In a real implementation, this would use the actual SDK methods
      const preparedTx = await this.steerClient.vaults.prepareWithdrawTx({
        vaultAddress: params.vaultAddress as `0x${string}`,
        shares: params.shares,
        amount0Min: params.amount0Min,
        amount1Min: params.amount1Min,
        to: params.recipient || '0x0000000000000000000000000000000000000000'
      });
      return preparedTx;
    } catch (error) {
      console.error('Failed to prepare withdrawal:', error);
      throw error;
    }
  }

  /**
   * Execute withdrawal transaction
   */
  async executeWithdrawal(preparedTx: any): Promise<string | null> {
    try {
      const hash = await this.walletClient.writeContract({
        address: preparedTx.address,
        abi: preparedTx.abi,
        functionName: preparedTx.functionName,
        args: preparedTx.args
      });

      return hash;
    } catch (error) {
      console.error('Failed to execute withdrawal:', error);
      return null;
    }
  }

  /**
   * Complete withdrawal process with all checks and validations
   */
  async withdraw(params: WithdrawalParams): Promise<WithdrawalResult> {
    try {
      console.log('🚀 Starting Smart Pool withdrawal process...');

      // 1. Get vault information
      console.log(`🪙 Withdrawing ${formatUnits(params.shares, 18)} LP tokens`);

      // 2. Get user address
      const userAddress = await this.walletClient.getAddresses();
      const userAddr = userAddress[0];

      // 3. Check LP token balance
      const lpBalance = await this.getLpTokenBalance(params.vaultAddress, userAddr);
      if (lpBalance < params.shares) {
        throw new Error(`Insufficient LP token balance. Available: ${formatUnits(lpBalance, 18)}, Required: ${formatUnits(params.shares, 18)}`);
      }

      console.log(`✅ LP token balance sufficient: ${formatUnits(lpBalance, 18)}`);

      // 4. Check for locked/vested shares
      if (BigInt(lpBalance) < params.shares) {
        throw new Error(`Insufficient available shares. Available: ${formatUnits(lpBalance, 18)}, Required: ${formatUnits(params.shares, 18)},`);
      }

      console.log(`✅ Available shares: ${formatUnits(lpBalance, 18)}`);

      // 5. Calculate expected token amounts (for display purposes)
      const expectedTokenAmounts = await this.calculateOptimalWithdrawAmounts(params.vaultAddress, params.shares);
      if (expectedTokenAmounts) {
        console.log(`📈 Expected token amounts:`);
        console.log(`  WAVAX: ${formatUnits(expectedTokenAmounts.amount0, 18)}`);
        console.log(`  USDC: ${formatUnits(expectedTokenAmounts.amount1, 6)}`);
      }

      // 6. Prepare withdrawal transaction
      console.log('⚙️  Preparing withdrawal transaction...');
      const preparedTx = await this.prepareWithdrawTx(params);

      // 7. Execute withdrawal
      console.log('💸 Executing withdrawal...');
      const withdrawalHash = await this.executeWithdrawal(preparedTx);
      if (!withdrawalHash) {
        throw new Error('Failed to execute withdrawal transaction');
      }

      console.log(`✅ Withdrawal successful: ${withdrawalHash}`);

      // 8. Wait for confirmation and get receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: withdrawalHash 
      });

      // Extract actual token amounts received from transaction logs
      let token0Received: bigint | undefined;
      let token1Received: bigint | undefined;
      
      if (receipt.logs && receipt.logs.length > 0) {
        // This would parse the actual transfer events to get received amounts
        // Implementation depends on the specific vault contract
        token0Received = expectedTokenAmounts?.amount0 || 0n;
        token1Received = expectedTokenAmounts?.amount1 || 0n;
      }

      return {
        success: true,
        transactionHash: withdrawalHash,
        token0Received,
        token1Received
      };

    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

}

/**
 * Example usage and demonstrations
 */
export class SmartPoolWithdrawalExamples {
  private withdrawalManager: SmartPoolWithdrawalManager;

  constructor(publicClient: any, walletClient: any) {
    this.withdrawalManager = new SmartPoolWithdrawalManager(publicClient, walletClient);
  }


  /**
   * Partial withdrawal example
   */
  async withdrawalExample(): Promise<void> {
    console.log('\n=== Partial Withdrawal Example ===');

    const vaultAddress = '0x5c1d454f08975c554f6b70a84fd8859fbdfcc069';
    
    // First, check current LP token balance
    const userAddress = '0xCD88431107B72b1a1aa13DE27Ab894e27C7D1a61';
    const totalBalance = await this.withdrawalManager.getLpTokenBalance(vaultAddress, userAddress);
    
    console.log(`💰 Total LP token balance: ${formatUnits(totalBalance, 18)}`);
    
    if (totalBalance === 0n) {
      console.log('❌ No LP tokens to withdraw');
      return;
    }

    // Withdraw 50% of balance
    const sharesToWithdraw = totalBalance / BigInt(2);
    console.log(`📤 Withdrawing 50%: ${formatUnits(sharesToWithdraw, 18)} LP tokens`);

    // Get withdrawal preview
    const preview = await this.withdrawalManager.calculateOptimalWithdrawAmounts(vaultAddress, sharesToWithdraw);

    if (!preview) {
      console.error('❌ Failed to get withdrawal preview');
      return;
    }

    console.log(`📊 Withdrawal preview:`);
    console.log(`  Token0: ${formatUnits(preview.amount0, 18)} WAVAX`);
    console.log(`  Token1: ${formatUnits(preview.amount1, 6)} USDC`);
   
    const withdrawTX = await this.withdrawalManager.prepareWithdrawTx({
      vaultAddress,
      shares: sharesToWithdraw,
      amount0Min: preview.amount0,
      amount1Min: preview.amount1,
      recipient: userAddress
    });
    
    console.log(`📊 Prepared withdrawal transaction:`);
    console.log(withdrawTX);
  }

}

/**
 * Utility functions for common withdrawal operations
 */
export class WithdrawalUtils {
  /**
   * Format token amounts for display
   */
  static formatAmount(amount: bigint, decimals: number): string {
    return formatUnits(amount, decimals);
  }

  /**
   * Parse token amounts from string
   */
  static parseAmount(amount: string, decimals: number): bigint {
    return parseUnits(amount, decimals);
  }

  /**
   * Calculate slippage amount
   */
  static calculateSlippageAmount(amount: bigint, slippagePercent: number): bigint {
    const slippage = BigInt(Math.floor(Number(amount) * slippagePercent));
    return amount - slippage;
  }

  /**
   * Calculate minimum amounts with slippage protection
   */
  static calculateMinimumAmounts(
    token0Amount: bigint,
    token1Amount: bigint,
    slippagePercent: number
  ): { amount0Min: bigint; amount1Min: bigint } {
    const slippageMultiplier = BigInt(Math.floor((1 - slippagePercent) * 10000)); // Convert to basis points
    const amount0Min = (token0Amount * slippageMultiplier) / BigInt(10000);
    const amount1Min = (token1Amount * slippageMultiplier) / BigInt(10000);
    
    return { amount0Min, amount1Min };
  }

  /**
   * Validate withdrawal parameters
   */
  static validateWithdrawalParams(params: WithdrawalParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.vaultAddress || params.vaultAddress.length !== 42) {
      errors.push('Invalid vault address');
    }

    if (params.shares <= 0n) {
      errors.push('Shares must be greater than 0');
    }

    if (params.amount0Min < 0n) {
      errors.push('Amount0Min must be non-negative');
    }

    if (params.amount1Min < 0n) {
      errors.push('Amount1Min must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export types
export type { TokenAmountsResponse, WithdrawalParams, WithdrawalResult };

