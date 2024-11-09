import { SUPPORTED_CHAIN_IDS, SUPPORTED_CHAINS, SUPPORTED_DEXS } from "./enum";
import { ChainConfig } from "./types";

export const CONFIGS: ChainConfig = {
  [SUPPORTED_CHAINS.ARBITRUM]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.ARBITRUM,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      coolDownPeriod: 60,
      isActiveRebalance: true,
      rebaseModuleBlockNumber: 244849689,
      twapQuoter: "0xC22E20950aA1f2e91faC75AB7fD8a21eF2C3aB1E",
      rebaseContract: "0xbc1548ff60913cb9b568489ec07dfc92135aeb85",
      oldRebaseContract: "0x599cbbce726a2d6a849364ab1a5b7ae1573af0bc",
      rpcUrl:
        "https://arb-mainnet.g.alchemy.com/v2/pOOD2a3D96fZqeiO7nCT3BdK4VU8SU8R",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/76993/a51-finance-uarb/version/latest",
    },
  },
  [SUPPORTED_CHAINS.ARBITRUM_FORK]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.ARBITRUM,
      isActive: true,
      isAutoExit: true,
      exitContract: "0x6C1644f43733FF86Cd0FD6fFBfc92Beb34993164",
      coolDownPeriod: 60,
      isActiveRebalance: true,
      rebaseModuleBlockNumber: 244849689,
      twapQuoter: "0xC22E20950aA1f2e91faC75AB7fD8a21eF2C3aB1E",
      rebaseContract: "0xbc1548ff60913cb9b568489ec07dfc92135aeb85",
      oldRebaseContract: "0x599cbbce726a2d6a849364ab1a5b7ae1573af0bc",
      subgraphUrl:
        "http://18.222.127.228:8000/subgraphs/name/cltbase-arb-tenderly",
      rpcUrl:
        "https://virtual.arbitrum.rpc.tenderly.co/6878c378-4aa7-4d65-b942-85f53c649fef",
    },
  },
  [SUPPORTED_CHAINS.BASE]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.BASE,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      twapQuoter: "0x634062496B8ecC63D597401D81d11d5d24eeDD55",
      oldRebaseContract: "",
      rebaseContract: "0x599cBbCE726a2d6a849364aB1A5b7ae1573Af0bC",
      rpcUrl:
        "https://base-mainnet.g.alchemy.com/v2/fSL2zVawdOziyTk3hPVfja2jwxnyJHKq",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-base/version/latest",
    },
    [SUPPORTED_DEXS.BASESWAP_UNI]: {
      chainId: SUPPORTED_CHAIN_IDS.BASE,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: true,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 18934336,
      twapQuoter: "0xAFB17876B2E8B5b5D1585393B6a19930a0AB6398",
      oldRebaseContract: "0xb7fa59b749B82991BF7Beec7129E0530525D0427",
      rebaseContract: "0x0C30B0727eE7F2c1c7CbB143C3D3AD399bC845e8",
      rpcUrl:
        "https://base-mainnet.g.alchemy.com/v2/fSL2zVawdOziyTk3hPVfja2jwxnyJHKq",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/76993/a51-finance-bbase/version/latest",
    },
  },
  [SUPPORTED_CHAINS.BLAST]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.BLAST,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      coolDownPeriod: 60,
      isActiveRebalance: false,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0xAE80E87E63727b6DE49367e6133809DE3A6E889E",
      twapQuoter: "0x5853b436F84a6fADAC0c2a00DFD5972Af84F7cBc",
      rpcUrl: "https://rpc.blast.io",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-blast/version/latest",
    },
    [SUPPORTED_DEXS.FENIX_INTEGRAL]: {
      chainId: SUPPORTED_CHAIN_IDS.BLAST,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      coolDownPeriod: 60,
      isActiveRebalance: false,
      rebaseModuleBlockNumber: 0,
      twapQuoter: "0x7166e3DFbd0aDe9B65Dce9212f4c6FdDD3d6881b",
      oldRebaseContract: "",
      rebaseContract: "0x1b353af746801Ff955E069C5AAF982184bEC6d14",
      rpcUrl: "https://rpc.blast.io",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/4129/cltbase-blast-fenix/version/latest",
    },
  },
  [SUPPORTED_CHAINS.BSC]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.BSC,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      twapQuoter: "0xA8Dc31c8C9F93dB2e42A5472F580689794639576",
      oldRebaseContract: "",
      rebaseContract: "0x8b35A8250673493c0B6Cda80327BFbBF4eEEf9B1",
      rpcUrl: "https://bsc-dataseed1.binance.org",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-bsc/version/latest",
    },
  },
  [SUPPORTED_CHAINS.LINEA]: {
    [SUPPORTED_DEXS.LYNEX_ALGEBRA]: {
      chainId: SUPPORTED_CHAIN_IDS.LINEA,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0x525C80e91efE9222DE3EAe86AF69A480fbced416",
      twapQuoter: "0xb0ca4Bbb5c66276BEA8B3349234dDeAB1FBda050",
      rpcUrl: "https://linea.blockpi.network/v1/rpc/public",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-linea-lynex/version/latest",
    },
  },
  [SUPPORTED_CHAINS.MANTA]: {
    [SUPPORTED_DEXS.QUICKSWAP_UNI]: {
      chainId: SUPPORTED_CHAIN_IDS.MANTA,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      oldRebaseContract: "",
      twapQuoter: "0x2935a23f015cE177d6Cc6BACCE189A2e0039a227",
      rebaseContract: "0x86f5714eCeA724Dc7A7A2bDc005AC36F08a46093",
      rebaseModuleBlockNumber: 0,
      rpcUrl: "https://pacific-rpc.manta.network/http",
      subgraphUrl:
        "https://apis.unipilot.io:5000/subgraphs/name/rafaqat11/a51finance",
    },
  },
  [SUPPORTED_CHAINS.MODE]: {
    [SUPPORTED_DEXS.SWAPMODE_UNI]: {
      chainId: SUPPORTED_CHAIN_IDS.MODE,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0x86f5714eCeA724Dc7A7A2bDc005AC36F08a46093",
      twapQuoter: "0x2935a23f015cE177d6Cc6BACCE189A2e0039a227",
      rpcUrl: "https://mainnet.mode.network",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/76993/a51finance-swap-mode/version/latest",
    },
  },
  [SUPPORTED_CHAINS.OPTIMISM]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.OPTIMISM,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0xdfb179526ae303eea49ac99dd360159c39105828",
      twapQuoter: "0x0f7ee2b5451bfba623314f8c94bbd965b3e8ab56",
      rpcUrl:
        "https://opt-mainnet.g.alchemy.com/v2/b6Sba96ZQCHyR5Ea_DffR0is1sRiwbW3",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-optimism/version/latest",
    },
  },
  [SUPPORTED_CHAINS.POLYGON]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.POLYGON,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0x3c0a4fA6ab84a1a89840030017450383D96a834f",
      twapQuoter: "0x794a5773b27e01463B51adba38Bf2Cb2d10245Dc",
      rpcUrl:
        "https://polygon-mainnet.g.alchemy.com/v2/ZYoN5wSIW7gj1lGowtoIAIGo5chE7muf",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-polygon/version/latest",
    },
  },
  [SUPPORTED_CHAINS.SCROLL]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.SCROLL,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0x525C80e91efE9222DE3EAe86AF69A480fbced416",
      twapQuoter: "0x9c225a02426e3229C073A6132E083561e95000b5",
      rpcUrl: "https://rpc.ankr.com/scroll",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-scroll/version/latest",
    },
  },
  [SUPPORTED_CHAINS.ZKEVM]: {
    [SUPPORTED_DEXS.UNISWAP]: {
      chainId: SUPPORTED_CHAIN_IDS.ZKEVM,
      isActive: false,
      isAutoExit: false,
      exitContract: "",
      isActiveRebalance: false,
      coolDownPeriod: 60,
      rebaseModuleBlockNumber: 0,
      oldRebaseContract: "",
      rebaseContract: "0x794a5773b27e01463B51adba38Bf2Cb2d10245Dc",
      twapQuoter: "0xb0ca4Bbb5c66276BEA8B3349234dDeAB1FBda050",
      rpcUrl:
        "https://polygonzkevm-mainnet.g.alchemy.com/v2/npG-zvTyRdHAJ0EBHR6MlcmxuoAccgcH",
      subgraphUrl:
        "https://api.studio.thegraph.com/query/20036/base-polygonzkevm-quickswap/version/latest",
    },
  },
};
