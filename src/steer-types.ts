/**
 * Steer Protocol SDK Type Definitions
 * 
 * This file contains type definitions that would typically be provided
 * by the @steerprotocol/sdk package, but are included here for the example.
 */

// Chain ID type

// Basic token interface
export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

// Vault interface
export interface Vault {
  id: string;
  address: string;
  token0: Token;
  token1: Token;
  protocol: string;
  beaconName: string;
  totalValueLocked: string;
  apy: number;
  createdAt: string;
  updatedAt: string;
}

// Vault edge for pagination
export interface VaultEdge {
  node: Vault;
  cursor: string;
}

// Page info for pagination
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

// Vaults response
export interface VaultsResponse {
  edges: VaultEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: 'api' | 'subgraph';
}



// Subgraph configuration
export interface SubgraphConfig {
  url: string;
  apiKey?: string | undefined;
  timeout: number;
}

// Error types
export class SteerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SteerError';
  }
}

export class NetworkError extends SteerError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class ValidationError extends SteerError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends SteerError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

// Configuration types
export interface SteerConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  timeout: number;
  retries: number;
  enableFallback: boolean;
}

// Event types for observables
export interface VaultEvent {
  type: 'created' | 'updated' | 'deleted';
  vault: Vault;
  timestamp: Date;
}

// Subscription types
export interface VaultSubscription {
  unsubscribe: () => void;
  on: (event: VaultEvent) => void;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Generic response type
export type SteerResponse<T> = {
  success: true;
  data: T;
  source: 'api' | 'subgraph';
} | {
  success: false;
  error: string;
  source?: 'api' | 'subgraph';
};

// Pagination parameters
export interface PaginationParams {
  limit: number;
  cursor?: string | null;
  offset?: number;
}

// Sort options
export interface SortOptions {
  field: keyof Vault;
  direction: 'asc' | 'desc';
}

// Query options

// Statistics types
export interface VaultStatistics {
  totalVaults: number;
  totalValueLocked: string;
  averageApy: number;
  protocols: Record<string, number>;
  beacons: Record<string, number>;
  chains: Record<string, number>;
}

// Health check types
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    api: 'up' | 'down';
    subgraph: 'up' | 'down';
  };
  timestamp: Date;
  responseTime: number;
}

// Rate limiting types
export interface RateLimit {
  limit: number;
  remaining: number;
  resetTime: Date;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items
  enabled: boolean;
}

// Logger interface
export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// Metrics interface
export interface Metrics {
  increment: (name: string, value?: number, tags?: Record<string, string>) => void;
  timing: (name: string, value: number, tags?: Record<string, string>) => void;
  gauge: (name: string, value: number, tags?: Record<string, string>) => void;
}

// Configuration validation
export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Feature flags
export interface FeatureFlags {
  enableSubgraphFallback: boolean;
  enableCaching: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
  enableRetries: boolean;
}

// All types are already exported above
