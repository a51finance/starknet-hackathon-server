import { SUPPORTED_CHAINS, SUPPORTED_DEXS } from "./enum";
import { ChainConfig } from "./types";

export const getChainConfigsFromChainId = (
  chainId: number,
  chainConfigs: ChainConfig
) => {
  for (const chain in chainConfigs) {
    const chainMap = chainConfigs[chain as SUPPORTED_CHAINS];
    for (const dex in chainMap) {
      const dexMap = chainMap[dex as SUPPORTED_DEXS];

      if (dexMap.chainId === chainId) return dexMap;
    }
  }
  return undefined;
};

export function serializeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

