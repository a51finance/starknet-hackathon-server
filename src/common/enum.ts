export enum SUPPORTED_CHAINS {
  ARBITRUM = "arb",
  ARBITRUM_FORK = "arb_fork",
  POLYGON = "poly",
  BLAST = "blast",
  OPTIMISM = "opti",
  BASE = "base",
  BSC = "bsc",
  MANTA = "manta",
  ZKEVM = "zkevm",
  LINEA = "linea",
  SCROLL = "scroll",
  MODE = "mode",
}

export enum SUPPORTED_CHAIN_IDS {
  ARBITRUM = 42161,
  ARBITRUM_FORK = 42161,
  POLYGON = 137,
  BLAST = 81457,
  OPTIMISM = 10,
  BASE = 8453,
  BSC = 56,
  MANTA = 169,
  ZKEVM = 1101,
  LINEA = 59144,
  SCROLL = 534352,
  MODE = 34443,
}

export enum SUPPORTED_DEXS {
  UNISWAP = "uniswap",
  QUICKSWAP_UNI = "quickswap-uni",
  QUICKSWAP_ALGEBRA = "quickswap-algebra",
  BASESWAP_UNI = "baseswap-uni",
  LYNEX_ALGEBRA = "lynex-algebra-1-9",
  FENIX_INTEGRAL = "fenix-integral",
  SWAPMODE_UNI = "swapmode-uni",
}

export enum TRANSACTION_TYPE {
  REBALANCE = "rebalance",
  EXIT = "exit",
}
