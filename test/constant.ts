import { IStrategies } from "src/common/types";

export const STRATEGY_MOCK_VALUE: IStrategies = {
  id: "0x0ab03be544b7e633d53dcf34bd5a3e7c44218769bb3e3757f144d414deef06de",
  chainId: "42161",
  tickLower: "-194220",
  tickUpper: "-193830",
  isPro: true,
  mode: "3",
  isExit: false,
  createdAtBlockNumber: "214953699",
  rebaseStrategies: [
    {
      thresholdLower: "100",
      thresholdUpper: "100",
      isPricePreference: true,
      noOfRebase: "0",
    },
  ],
  pool: { id: "0xc6962004f452be9203591991d15f6b388e09e8d0" },
};
