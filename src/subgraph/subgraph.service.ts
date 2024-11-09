import axios from "axios";
import { query_strategies } from "./queries";
import {
  ChainConfig,
  IFetchAllStrategiesReturnDto,
  IFetchStrategiesDto,
  IStrategies,
} from "src/common/types";
import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SubgraphService {
  private readonly logger = new Logger(SubgraphService.name);

  fetchSubgraphData = async <T>(
    query: any,
    overwriteUrl: string
  ): Promise<T> => {
    try {
      const URL = overwriteUrl;

      const response = await axios.post(URL, {
        query: jsonToGraphQLQuery(query),
      });

      if (response.data.errors) {
        console.error(
          "Error fetching data from subgraph:",
          response.data.errors
        );
        throw new Error("Subgraph query failed");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error making request to subgraph:", error);
      throw error;
    }
  };

  fetchStrategies = async ({
    overwriteUrl,
    first = 1000,
    skip = 0,
    isActiveRebalance,
  }: IFetchStrategiesDto) => {
    const query = query_strategies(first, skip, isActiveRebalance);
    const { strategies } = await this.fetchSubgraphData<{
      strategies: IStrategies[];
    }>(query, overwriteUrl);

    return strategies;
  };

  fetchAllChainsStrategies = async (configs: ChainConfig) => {
    try {
      this.logger.debug("starting to fetch strategies.");
      const strategiesPromises: Promise<any>[] = [];

      for (let chain in configs) {
        const selectedChain = configs[chain];

        for (let dex in selectedChain) {
          const selectedDex = selectedChain[dex];
          if (!selectedDex.isActive) {
            this.logger.verbose(
              `Skipping chain ${chain} as it's not activated in configs.`
            );
            continue;
          }
          strategiesPromises.push(
            this.fetchStrategies({
              overwriteUrl: selectedDex.subgraphUrl,
            }).then((response) => ({
              chainSlug: chain,
              dex: dex,
              strategies: response,
            }))
          );
        }
      }

      const responses = await Promise.all<IFetchAllStrategiesReturnDto>(
        strategiesPromises
      );

      this.logger.debug("all strategies fetched.");
      return responses;
    } catch (e) {
      this.logger.error(e.message);
    }
  };
}
