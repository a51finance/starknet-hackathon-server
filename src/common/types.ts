import { ContractTransactionReceipt, Interface, Wallet } from "ethers";
import { SUPPORTED_CHAINS, SUPPORTED_DEXS, TRANSACTION_TYPE } from "./enum";

export interface IFetchStrategiesDto {
  overwriteUrl: string;
  first?: number;
  skip?: number;
  isActiveRebalance?: boolean;
}

export interface IStrategies {
  id: string;
  chainId: string;
  tickLower: string;
  tickUpper: string;
  isPro: boolean;
  isExit: boolean;
  mode: string;
  createdAtBlockNumber: string;
  rebaseStrategies: {
    thresholdLower: string;
    thresholdUpper: string;
    isPricePreference: boolean;
    isActiveRebalance?: boolean;
    innerThresholdLower?: string;
    innerThresholdUpper?: string;
    noOfRebase: string;
  }[];
  exitStrategies: {
    id: string;
    lowerTick?: string;
    upperTick?: string;
  }
  pool: {
    id: string;
  };
}

export interface IChainConfig {
  chainId: number;
  isActive: boolean;
  isActiveRebalance: boolean;
  isAutoExit: boolean;
  rebaseModuleBlockNumber: number;
  subgraphUrl: string;
  oldRebaseContract: string;
  rebaseContract: string;
  exitContract: string;
  twapQuoter: string;
  rpcUrl: string;
  coolDownPeriod: number;
}

export interface IMultiCallParams {
  address: string;
  contractInterface: Interface;
  methodName: string;
  callInputs: any[];
}

export interface IRebasedStrategies {
  [key: string]: number;
}

export interface IFetchAllStrategiesReturnDto {
  chainSlug: string;
  dex: string;
  strategies: IStrategies[];
}

export interface IRebalanceStrategyDto {
  newRebaseStrategies: string[];
  oldRebaseStrategies: string[];
  newRebaseAddress: string;
  oldRebaseAddress: string;
  rpc: string;
  chain: SUPPORTED_CHAINS;
  dex: SUPPORTED_DEXS;
}

export interface IRebalanceStrategyTransaction {
  isNewRebase: boolean;
  contractAddress: string;
  strategies: string[];
}

export interface ITransactionOverrideParams {
  from: string;
  gasLimit: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
}

export interface IRebalanceStrategyTransactionResponse
  extends ITransactionOverrideParams {
  receipt: ContractTransactionReceipt | null;
  strategyId: string[];
  date: Date;
}

export interface ISaveTransactionDto {
  chain: SUPPORTED_CHAINS;
  dex: SUPPORTED_DEXS;
  transactions: IRebalanceStrategyTransactionResponse[];
  transactionType: TRANSACTION_TYPE;
}

export type GenericChainMap<T> = { [chain in SUPPORTED_CHAINS]: T };
export type GenericDexMap<T> = { [dex in SUPPORTED_DEXS]?: T };
export type RebasedStrategies = GenericChainMap<
  GenericDexMap<IRebasedStrategies>
>;
export type ChainConfig = GenericChainMap<GenericDexMap<IChainConfig>>;
