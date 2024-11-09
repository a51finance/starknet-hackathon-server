import { CONFIGS } from "src/common/mapping";
import { CustomCache } from "src/config";
import { SubgraphService } from "src/subgraph/subgraph.service";
import { STRATEGY_MOCK_VALUE } from "test/constant";

jest.mock("axios");

describe("Subgraph Service", () => {
  const url = "http://18.222.127.228:8000/subgraphs/name/cltbase-arb-tenderly";
  let subgraphService: SubgraphService;

  beforeEach(() => {
    subgraphService = new SubgraphService();
  });

  it("should fetch strategies from the subgraph", async () => {
    jest.spyOn(subgraphService, "fetchSubgraphData").mockResolvedValue({
      strategies: [STRATEGY_MOCK_VALUE],
    });

    const result = await subgraphService.fetchStrategies({
      overwriteUrl: url,
    });
    expect(result).toBeInstanceOf(Object);
    expect(result).toEqual([STRATEGY_MOCK_VALUE]);
    expect(subgraphService.fetchSubgraphData).toHaveBeenCalledWith(
      expect.any(Object),
      url
    );
  });

  it("should handle errors during fetching from the subgraph", async () => {
    jest
      .spyOn(subgraphService, "fetchStrategies")
      .mockRejectedValue(new Error("Subgraph fetch error"));
    await expect(
      subgraphService.fetchStrategies({
        overwriteUrl: url,
      })
    ).rejects.toThrow("Subgraph fetch error");
  });

  it("should validate fetched strategy data", async () => {
    jest
      .spyOn(subgraphService, "fetchStrategies")
      .mockResolvedValue([STRATEGY_MOCK_VALUE]);
    const strategies = await subgraphService.fetchStrategies({
      overwriteUrl: url,
    });
    strategies.forEach((strategy) => {
      expect(strategy.tickLower).not.toBeNull();
    });
  });

  it("should fetch strategies from all chains and DEXs", async () => {
    const mockConfigs = CONFIGS;
    jest
      .spyOn(subgraphService, "fetchStrategies")
      .mockResolvedValue([STRATEGY_MOCK_VALUE]);

    const result = await subgraphService.fetchAllChainsStrategies(mockConfigs);
    const expecetdResult = Object.keys(mockConfigs)
      .flatMap((chain) => {
        return Object.keys(mockConfigs[chain]).map((dex) => {
          if (mockConfigs[chain][dex].isActive)
            return {
              chainSlug: chain,
              dex,
              strategies: [STRATEGY_MOCK_VALUE],
            };
        });
      })
      .filter((value) => typeof value !== "undefined");

    expect(result).toHaveLength(1); // as only 1 chain is active in config
    expect(subgraphService.fetchStrategies).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expecetdResult);
  });
});
