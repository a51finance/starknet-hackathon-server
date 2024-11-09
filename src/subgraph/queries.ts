export const query_strategies = (
  first: number = 1000,
  skip: number = 0,
  isActiveRebalance?: boolean,
  isAutoExit?: boolean
) => {
  const rebase = isActiveRebalance
    ? {
        thresholdLower: true,
        thresholdUpper: true,
        isPricePreference: true,
        isActiveRebalance: true,
        innerThresholdLower: true,
        innerThresholdUpper: true,
        noOfRebase: true,
      }
    : {
        thresholdLower: true,
        thresholdUpper: true,
        isPricePreference: true,
        noOfRebase: true,
      };

  const exit = isAutoExit
    ? {
        id: true,
        lowerTick: true,
        upperTick: true,
      }
    : {
        id: true,
      };

  return {
    query: {
      strategies: {
        __args: {
          first,
          skip,
          where: {
            totalShares_gt: 3,
          },
        },
        id: true,
        chainId: true,
        tickLower: true,
        tickUpper: true,
        isPro: true,
        mode: true,
        isExit: true,
        createdAtBlockNumber: true,

        rebaseStrategies: rebase,
        exitStrategies: exit,
        pool: {
          id: true,
        },
      },
    },
  };
};
