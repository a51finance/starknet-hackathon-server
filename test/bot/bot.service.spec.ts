import { Test, TestingModule } from "@nestjs/testing";
import { ethers } from "ethers";
import { BotService } from "src/bot/bot.service";
import { SUPPORTED_CHAINS, SUPPORTED_DEXS } from "src/common/enum";
import { CONFIGS } from "src/common/mapping";
import { ChainConfig } from "src/common/types";
import {
  BLACKLIST_STRATEGIES_CACHE,
  CONFIG_CACHE,
  REBASED_STRATEGIES_CACHE,
} from "src/common/variables";
import { CustomCache } from "src/config";
import { ContractsService } from "src/contracts/contract.service";
import { PostgresService } from "src/database/postgres.service";
import { QueuesProvider } from "src/queues/queues.provider";
import { SubgraphService } from "src/subgraph/subgraph.service";
import { STRATEGY_MOCK_VALUE } from "test/constant";

describe("BotService", () => {
  let botService: BotService;
  let subgraphService: SubgraphService;
  let queueService: QueuesProvider;
  let contractService: ContractsService;
  let customCache: CustomCache;
  let postgresService: PostgresService;
  let logSpy: jest.SpyInstance;
  let getTwapMock: jest.Mock;

  beforeEach(async () => {
    getTwapMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        {
          provide: SubgraphService,
          useValue: {
            // Mock the methods you use in BotService
            fetchAllChainsStrategies: jest
              .fn()
              .mockResolvedValue([STRATEGY_MOCK_VALUE]),
          },
        },
        {
          provide: QueuesProvider,
          useValue: {
            // Mock queueService methods
            assertStrategies: jest.fn(),
            executeStrategies: jest.fn(),
            saveExecutedTransactions: jest.fn(),
          },
        },
        {
          provide: ContractsService,
          useValue: {
            // Mock contract methods
            withProvider: jest.fn().mockReturnValue({
              getTwap: getTwapMock,
              rebalanceStrategiesTransaction: jest.fn(),
            }),
            getTwap: getTwapMock,
            rebalanceStrategiesTransaction: jest.fn(),
          },
        },
        {
          provide: CustomCache,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              switch (key) {
                case CONFIG_CACHE:
                  return CONFIGS;
                case REBASED_STRATEGIES_CACHE:
                  return {};
                case BLACKLIST_STRATEGIES_CACHE:
                  return [];
                default:
                  return null;
              }
            }),
            set: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: PostgresService,
          useValue: {
            createTransactions: jest.fn(),
            saveTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    // Inject services after module setup
    botService = module.get<BotService>(BotService);
    subgraphService = module.get<SubgraphService>(SubgraphService);
    queueService = module.get<QueuesProvider>(QueuesProvider);
    contractService = module.get<ContractsService>(ContractsService);
    customCache = module.get<CustomCache>(CustomCache);
    postgresService = module.get<PostgresService>(PostgresService);

    logSpy = jest.spyOn((botService as any).logger, "error");
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(botService).toBeDefined();
    });
  });

  describe("fetch Strategies function", () => {
    it("should fetch strategies and queue them", async () => {
      const response = await botService.fetchStrategies(CONFIGS);
      expect(subgraphService.fetchAllChainsStrategies).toHaveBeenCalled();
      expect(queueService.assertStrategies).toHaveBeenCalled();
      expect(response).toEqual(true);
    });

    it("should reject on invalid config passed to fetch strategies", async () => {
      const response = await botService.fetchStrategies(null as ChainConfig);
      expect(queueService.assertStrategies).not.toHaveBeenCalled();
      expect(response).toEqual(false);
    });

    it("should handle empty strategies from subgraphService", async () => {
      jest
        .spyOn(subgraphService, "fetchAllChainsStrategies")
        .mockResolvedValueOnce([]);
      const response = await botService.fetchStrategies(CONFIGS);
      expect(queueService.assertStrategies).not.toHaveBeenCalled();
      expect(response).toEqual(true);
    });

    it("should handle errors from subgraphService", async () => {
      jest
        .spyOn(subgraphService, "fetchAllChainsStrategies")
        .mockRejectedValueOnce(new Error("Subgraph error"));
      const response = await botService.fetchStrategies(CONFIGS);
      expect(queueService.assertStrategies).not.toHaveBeenCalled();
      expect(response).toEqual(false);
    });

    it("should handle timeouts or network issues", async () => {
      jest
        .spyOn(subgraphService, "fetchAllChainsStrategies")
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 4000))
        );
      const response = await botService.fetchStrategies(CONFIGS);
      expect(queueService.assertStrategies).not.toHaveBeenCalled();
      expect(response).toEqual(true);
    });
  });

  describe("assert strategies function", () => {
    it("should fetch chain configs, rebased strategies, and blacklisted strategies from cache", async () => {
      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };
      const response = await botService.assertStrategies(params);

      expect(customCache.get).toHaveBeenCalledWith(CONFIG_CACHE);
      expect(customCache.get).toHaveBeenCalledWith(REBASED_STRATEGIES_CACHE);
      expect(customCache.get).toHaveBeenCalledWith(BLACKLIST_STRATEGIES_CACHE);
      expect(response).toEqual(true);
    });

    it("should skip blacklisted strategies", async () => {
      jest
        .spyOn(customCache, "get")
        .mockReturnValueOnce(Promise.resolve(CONFIGS)) // For CONFIG_CACHE
        .mockReturnValueOnce(Promise.resolve({})) // For REBASED_STRATEGIES_CACHE
        .mockReturnValueOnce(Promise.resolve([STRATEGY_MOCK_VALUE.id])); // For BLACKLIST_STRATEGIES_CACHE

      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      await botService.assertStrategies(params);

      // Verify that the BLACKLIST_STRATEGIES_CACHE was checked
      expect(customCache.get).toHaveBeenCalledWith(BLACKLIST_STRATEGIES_CACHE);
      await expect(customCache.get).toHaveNthReturnedWith(
        3,
        Promise.resolve([STRATEGY_MOCK_VALUE.id])
      );

      // Ensure the blacklisted strategy was found and TWAP & execution skipped
      expect(contractService.getTwap).not.toHaveBeenCalled();
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });

    it("should skip strategies that recently had rebase activity", async () => {
      jest
        .spyOn(botService as any, "checkLastRebaseActivityOfStrategy")
        .mockReturnValue(true);

      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      await botService.assertStrategies(params);

      expect(
        (botService as any).checkLastRebaseActivityOfStrategy
      ).toHaveBeenCalled();
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });

    it("should skip strategy which cooldown period haven't finished yet", async () => {
      const TWO_MINUTES = 1000 * 120;
      jest
        .spyOn(customCache, "get")
        .mockReturnValueOnce(Promise.resolve(CONFIGS)) // For CONFIG_CACHE
        .mockReturnValueOnce(
          Promise.resolve({
            [SUPPORTED_CHAINS.ARBITRUM_FORK]: {
              [SUPPORTED_DEXS.UNISWAP]: {
                [STRATEGY_MOCK_VALUE.id]: new Date().getTime() - TWO_MINUTES,
              },
            },
          })
        ) // For REBASED_STRATEGIES_CACHE
        .mockReturnValueOnce(Promise.resolve([])); // For BLACKLIST_STRATEGIES_CACHE

      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      await botService.assertStrategies(params);

      expect(contractService.getTwap).not.toHaveBeenCalled();
    });

    it("should not skip strategy whose cooldown period has finished", async () => {
      const MINUTE = 1000 * 60;
      jest
        .spyOn(customCache, "get")
        .mockReturnValueOnce(Promise.resolve(CONFIGS)) // For CONFIG_CACHE
        .mockReturnValueOnce(
          Promise.resolve({
            [SUPPORTED_CHAINS.ARBITRUM_FORK]: {
              [SUPPORTED_DEXS.UNISWAP]: {
                [STRATEGY_MOCK_VALUE.id]: new Date().getTime() - MINUTE * 61,
              },
            },
          })
        ) // For REBASED_STRATEGIES_CACHE
        .mockReturnValueOnce(Promise.resolve([])); // For BLACKLIST_STRATEGIES_CACHE

      const checkRebaseSpy = jest
        .spyOn(botService as any, "checkLastRebaseActivityOfStrategy")
        .mockReturnValueOnce(false); // Simulate that cooldown has finished

      const twapValue = BigInt(100); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value

      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      await botService.assertStrategies(params);

      expect(checkRebaseSpy).toHaveBeenCalledWith(
        SUPPORTED_CHAINS.ARBITRUM_FORK,
        SUPPORTED_DEXS.UNISWAP,
        STRATEGY_MOCK_VALUE,
        60
      );
      expect(checkRebaseSpy).toHaveReturnedWith(false);
      expect(contractService.getTwap).toHaveBeenCalled();
    });

    it("should queue strategies to execute which are out of range", async () => {
      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(100); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        STRATEGY_MOCK_VALUE
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(true);
      expect(queueService.executeStrategies).toHaveBeenCalled();
    });

    it("should not queue strategies to execute which are out of range", async () => {
      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-193930); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        STRATEGY_MOCK_VALUE
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(false);
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });

    it("should not queue strategy to execute if strategy is static mode", async () => {
      const params = {
        strategies: [{ ...STRATEGY_MOCK_VALUE, mode: "4" }],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-100); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(Number(twapValue), {
        ...STRATEGY_MOCK_VALUE,
        mode: "4",
      });
      expect(isOutOfRangeSpy).toHaveReturnedWith(false);
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });

    it("should not queue strategy to execute if strategy is bull mode but out of range in opposite direction", async () => {
      const params = {
        strategies: [{ ...STRATEGY_MOCK_VALUE, mode: "2" }],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-1000000); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        params.strategies[0]
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(false);
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });

    it("should queue strategy to execute if strategy is bull mode out of range in bull direction", async () => {
      const params = {
        strategies: [{ ...STRATEGY_MOCK_VALUE, mode: "2" }],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-100); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        params.strategies[0]
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(true);
      expect(queueService.executeStrategies).toHaveBeenCalled();
    });

    it("should not queue strategy to execute if strategy is bear mode but out of range in opposite direction", async () => {
      const params = {
        strategies: [{ ...STRATEGY_MOCK_VALUE, mode: "1" }],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-100); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        params.strategies[0]
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(false);
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });

    it("should queue strategy to execute if strategy is bear mode out of range in bear direction", async () => {
      const params = {
        strategies: [{ ...STRATEGY_MOCK_VALUE, mode: "1" }],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-10000000); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        params.strategies[0]
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(true);
      expect(queueService.executeStrategies).toHaveBeenCalled();
    });

    it("should queue strategies for execution in dynamic mode if out of range in bull direction", async () => {
      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-100); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        params.strategies[0]
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(true);
      expect(queueService.executeStrategies).toHaveBeenCalled();
    });

    it("should queue strategies for execution in dynamic mode if out of range in bear direction", async () => {
      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      const twapValue = BigInt(-10000000); // Example TWAP value
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockResolvedValueOnce(twapValue); // Ensure it returns a mock TWAP value
      const isOutOfRangeSpy = jest.spyOn(
        botService as any,
        "isStrategyOutOfRange"
      );

      await botService.assertStrategies(params);

      expect(isOutOfRangeSpy).toHaveBeenCalledWith(
        Number(twapValue),
        params.strategies[0]
      );
      expect(isOutOfRangeSpy).toHaveReturnedWith(true);
      expect(queueService.executeStrategies).toHaveBeenCalled();
    });

    it("should skip strategy when fetching TWAP fails", async () => {
      const params = {
        strategies: [STRATEGY_MOCK_VALUE],
        chainSlug: SUPPORTED_CHAINS.ARBITRUM_FORK,
        dex: SUPPORTED_DEXS.UNISWAP,
      };

      // Mock the TWAP to throw an error
      jest
        .spyOn(
          contractService.withProvider(
            CONFIGS[SUPPORTED_CHAINS.ARBITRUM_FORK][SUPPORTED_DEXS.UNISWAP]
              .rpcUrl
          ),
          "getTwap"
        )
        .mockRejectedValueOnce(new Error("TWAP fetch failed"));

      await botService.assertStrategies(params);

      // Ensure the strategy is skipped and error is logged
      expect(logSpy).toHaveBeenCalledWith(
        `failed to fetch twap for strategy id: ${STRATEGY_MOCK_VALUE.id}, pool: ${STRATEGY_MOCK_VALUE.pool.id}, skipping this strategy.`
      );

      // Ensure that no strategies are queued for execution due to TWAP failure
      expect(queueService.executeStrategies).not.toHaveBeenCalled();
    });
  });
});
