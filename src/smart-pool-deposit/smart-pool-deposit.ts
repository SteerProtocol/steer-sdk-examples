/**
 * Smart Pool Deposit Example
 * 
 * This example demonstrates how to deposit assets into Steer Protocol Smart Pools
 * using the SDK with proper error handling, token approvals, and transaction management.
 */

import { createPublicClient, createWalletClient, http, parseUnits, formatUnits, Address } from 'viem';
import { polygon, arbitrum, avalanche } from 'viem/chains';
import { SteerClient } from '@steerprotocol/sdk';

// Type definitions for the deposit process
interface DepositParams {
  vaultAddress: Address;
  amount0Desired: bigint;
  amount1Desired: bigint;
  slippage: number;
  recipient?: Address;
}

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

interface VaultInfo {
  address: string;
  token0: TokenInfo;
  token1: TokenInfo;
  name: string;
  protocol: string;
}

interface DepositResult {
  success: boolean;
  transactionHash?: string;
  sharesReceived?: bigint;
  error?: string;
}

/**
 * Smart Pool Deposit Manager
 * 
 * Handles the complete deposit process including approvals, calculations, and execution
 */
export class SmartPoolDepositManager {
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

  public getPublicClient() {
    return this.publicClient;
  }

  /**
   * Get vault information and token details
   */
  async getVaultInfo(vaultAddress: string): Promise<VaultInfo | null> {
    try {
      // This would typically come from the Steer API or subgraph
      // For demonstration, we'll use mock data
      const mockVaults: Record<string, VaultInfo> = {
        '0x1234567890123456789012345678901234567890': {
          address: vaultAddress,
          token0: {
            address: '0xA0b86a33E6417C4b9A8E0C3B5d9c8F4A3E2D1C0B',
            symbol: 'USDC',
            decimals: 6
          },
          token1: {
            address: '0xB1c97a44F6528D2C9B3F1E5D8C7A6B5E4D3C2B1A',
            symbol: 'USDT',
            decimals: 6
          },
          name: 'USDC/USDT Smart Pool',
          protocol: 'Uniswap V3'
        }
      };

      return mockVaults[vaultAddress] || null;
    } catch (error) {
      console.error('Failed to get vault info:', error);
      return null;
    }
  }

  /**
   * Get deposit ratio for maintaining pool balance
   */
  async getDepositRatio(vaultAddress: string, zeroForOne: boolean): Promise<number | null> {
    try {
      const ratioResponse = await this.steerClient.vaults.getDepositRatio(
        vaultAddress as `0x${string}`,
        zeroForOne
      );

      if (!ratioResponse.success || !ratioResponse.data) {
        throw new Error('Failed to get deposit ratio');
      }

      return ratioResponse.data.ratio as number;
    } catch (error) {
      console.error('Failed to get deposit ratio:', error);
      return null;
    }
  }

  /**
   * Calculate corresponding token amount
   */
  async getCorrespondingTokenAmount(
    vaultAddress: string,
    amount: bigint,
    reverse: boolean
  ): Promise<bigint | null> {
    try {
      const response = await this.steerClient.vaults.getCorrespondingTokenAmount(
        vaultAddress as `0x${string}`,
        amount,
        reverse
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to calculate corresponding token amount');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to calculate corresponding token amount:', error);
      return null;
    }
  }

  /**
   * Check token balance for an address
   */
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
    try {
      const balance = await this.publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [{
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }]
        }],
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      });

      return balance as bigint;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0n;
    }
  }

  /**
   * Check token allowance for spender
   */
  async getTokenAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<bigint> {
    try {
      const allowance = await this.publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [{
          name: 'allowance',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
          ],
          outputs: [{ name: '', type: 'uint256' }]
        }],
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`]
      });

      return allowance as bigint;
    } catch (error) {
      console.error('Failed to get token allowance:', error);
      return 0n;
    }
  }

  /**
   * Approve token spending
   */
  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: bigint
  ): Promise<string | null> {
    try {
      const hash = await this.walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: [{
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }],
        functionName: 'approve',
        args: [spender as `0x${string}`, amount]
      });

      // Wait for transaction confirmation
      await this.publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (error) {
      console.error('Failed to approve token:', error);
      return null;
    }
  }

  /**
   * Prepare deposit transaction
   */
  async prepareDeposit(params: DepositParams) {
    try {
      // Mock transaction preparation for demonstration
      // In a real implementation, this would use the actual SDK methods
        const preparedTx = await this.steerClient.vaults.prepareDepositTx({
          vaultAddress: params.vaultAddress as `0x${string}`,
          amount0Desired: params.amount0Desired,
          amount1Desired: params.amount1Desired,
          slippage: params.slippage,
          to: params.recipient || '0x0000000000000000000000000000000000000000'
        });

      return preparedTx;
    } catch (error) {
      console.error('Failed to prepare deposit:', error);
      throw error;
    }
  }

  /**
   * Execute deposit transaction
   */
  async executeDeposit(preparedTx: any): Promise<string | null> {
    try {
      const hash = await this.walletClient.writeContract({
        address: preparedTx.address,
        abi: preparedTx.abi,
        functionName: preparedTx.functionName,
        args: preparedTx.args
      });

      return hash;
    } catch (error) {
      console.error('Failed to execute deposit:', error);
      return null;
    }
  }

  /**
   * Complete deposit process with all checks and approvals
   */
  async deposit(params: DepositParams): Promise<DepositResult> {
    try {
      console.log('🚀 Starting Smart Pool deposit process...');

      // 1. Get vault information
      const vaultInfo = await this.getVaultInfo(params.vaultAddress);
      if (!vaultInfo) {
        throw new Error('Vault not found or invalid');
      }

      console.log(`📊 Vault: ${vaultInfo.name}`);
      console.log(`🪙 Token0: ${vaultInfo.token0.symbol} (${formatUnits(params.amount0Desired, vaultInfo.token0.decimals)})`);
      console.log(`🪙 Token1: ${vaultInfo.token1.symbol} (${formatUnits(params.amount1Desired, vaultInfo.token1.decimals)})`);

      // 2. Get user address
      const userAddress = await this.walletClient.getAddresses();
      const userAddr = userAddress[0];

      // 3. Check token balances
      const balance0 = await this.getTokenBalance(vaultInfo.token0.address, userAddr);
      const balance1 = await this.getTokenBalance(vaultInfo.token1.address, userAddr);

      if (balance0 < params.amount0Desired) {
        throw new Error(`Insufficient ${vaultInfo.token0.symbol} balance`);
      }
      if (balance1 < params.amount1Desired) {
        throw new Error(`Insufficient ${vaultInfo.token1.symbol} balance`);
      }

      console.log('✅ Token balances sufficient');

      // 4. Check and handle token approvals
      const allowance0 = await this.getTokenAllowance(
        vaultInfo.token0.address,
        userAddr,
        params.vaultAddress
      );
      const allowance1 = await this.getTokenAllowance(
        vaultInfo.token1.address,
        userAddr,
        params.vaultAddress
      );

      // Approve token0 if needed
      if (allowance0 < params.amount0Desired) {
        console.log(`🔐 Approving ${vaultInfo.token0.symbol}...`);
        const approveHash0 = await this.approveToken(
          vaultInfo.token0.address,
          params.vaultAddress,
          params.amount0Desired
        );
        if (!approveHash0) {
          throw new Error(`Failed to approve ${vaultInfo.token0.symbol}`);
        }
        console.log(`✅ ${vaultInfo.token0.symbol} approved: ${approveHash0}`);
      }

      // Approve token1 if needed
      if (allowance1 < params.amount1Desired) {
        console.log(`🔐 Approving ${vaultInfo.token1.symbol}...`);
        const approveHash1 = await this.approveToken(
          vaultInfo.token1.address,
          params.vaultAddress,
          params.amount1Desired
        );
        if (!approveHash1) {
          throw new Error(`Failed to approve ${vaultInfo.token1.symbol}`);
        }
        console.log(`✅ ${vaultInfo.token1.symbol} approved: ${approveHash1}`);
      }

      // 5. Prepare deposit transaction
      console.log('⚙️  Preparing deposit transaction...');
      const preparedTx = await this.prepareDeposit(params);

      // 6. Execute deposit
      console.log('💸 Executing deposit...');
      const depositHash = await this.executeDeposit(preparedTx);
      if (!depositHash) {
        throw new Error('Failed to execute deposit transaction');
      }

      console.log(`✅ Deposit successful: ${depositHash}`);

      // 7. Wait for confirmation and get receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: depositHash 
      });

      // Extract shares received from transaction logs if available
      let sharesReceived: bigint | undefined;
      if (receipt.logs && receipt.logs.length > 0) {
        // This would parse the actual transfer event to get shares
        // Implementation depends on the specific vault contract
        sharesReceived = 0n; // Placeholder
      }

      return {
        success: true,
        transactionHash: depositHash,
        sharesReceived
      };

    } catch (error) {
      console.error('❌ Deposit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate optimal deposit amounts based on current pool ratio
   */
  async calculateOptimalDepositAmounts(
    vaultAddress: string,
    tokenAmount: bigint,
    isZeroForOne: boolean
  ): Promise<{ amount0: bigint; amount1: bigint } | null> {
    try {
      // Get deposit ratio
      const ratio = await this.getDepositRatio(vaultAddress, isZeroForOne); // false = token0 -> token1
      if (!ratio) {
        throw new Error('Failed to get deposit ratio');
      }

      // Calculate token1 amount
      const amount1 = await this.getCorrespondingTokenAmount(
        vaultAddress,
        tokenAmount,
        isZeroForOne
      );
      if (!amount1) {
        throw new Error('Failed to calculate token1 amount');
      }

      return {
        amount0: isZeroForOne ? tokenAmount : amount1,
        amount1: isZeroForOne ? amount1 : tokenAmount
      };
    } catch (error) {
      console.error('Failed to calculate optimal amounts:', error);
      return null;
    }
  }
}

/**
 * Example usage and demonstrations
 */
export class SmartPoolDepositExamples {
  private depositManager: SmartPoolDepositManager;

  constructor(publicClient: any, walletClient: any) {
    this.depositManager = new SmartPoolDepositManager(publicClient, walletClient);
  }


  async depositExampleWithTokenInput(
    vaultAddress: Address,
    tokenInput: bigint,
    isToken0Input: boolean,
    userAddress: Address
  ): Promise<void> {
    console.log('\n=== Deposit Example ===');
    console.log('Token 0 Input: ', isToken0Input);
    const optimalAmounts = await this.depositManager.calculateOptimalDepositAmounts(
      vaultAddress,
      tokenInput,
      isToken0Input
    );

    if (optimalAmounts) {
      console.log(`📊 Optimal deposit amounts:`);
      console.log(`Token0 (WAVAX): ${formatUnits(optimalAmounts.amount0, 18)}`);
      console.log(`Token1 (USDT): ${formatUnits(optimalAmounts.amount1, 6)}`);

      const result = await this.depositManager.prepareDeposit({
          vaultAddress,
          amount0Desired: optimalAmounts.amount0,
          amount1Desired: optimalAmounts.amount1,
          slippage: 0.005,
          recipient: userAddress
      });

      console.log(`📊 Prepared deposit transaction:`);
      console.log(result);
    
    }

  }


  /**
   * Optimal deposit calculation example with both token amounts
   */
  async depositExample(): Promise<void> {
    console.log('\n=== Optimal Deposit Calculation Example ===');

    // WAVAX/USDC
    const vaultAddress = '0x5c1d454f08975c554f6b70a84fd8859fbdfcc069';
    const userAddress = '0xCD88431107B72b1a1aa13DE27Ab894e27C7D1a61';

    const token0Input = parseUnits('50', 18); // 1000 WAVAX
    await this.depositExampleWithTokenInput(vaultAddress, token0Input, true, userAddress);


    const token1Input = parseUnits('60', 6); // 1000 USDT
    await this.depositExampleWithTokenInput(vaultAddress, token1Input, false, userAddress);

  }


}

/**
 * Utility functions for common deposit operations
 */
export class DepositUtils {
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
   * Validate deposit parameters
   */
  static validateDepositParams(params: DepositParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.vaultAddress || params.vaultAddress.length !== 42) {
      errors.push('Invalid vault address');
    }

    if (params.amount0Desired <= 0n) {
      errors.push('Amount0 must be greater than 0');
    }

    if (params.amount1Desired <= 0n) {
      errors.push('Amount1 must be greater than 0');
    }

    if (params.slippage < 0 || params.slippage > 1) {
      errors.push('Slippage must be between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export types
export type { DepositParams, DepositResult, TokenInfo, VaultInfo };

