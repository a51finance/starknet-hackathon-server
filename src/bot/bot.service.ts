import { Injectable, Logger } from "@nestjs/common";
import {
  ChainConfig,
  IFetchAllStrategiesReturnDto,
  IRebalanceStrategyDto,
  IStrategies,
  RebasedStrategies,
  IRebalanceStrategyTransactionResponse,
  ISaveTransactionDto,
} from "src/common/types";
import {
  SUPPORTED_CHAINS,
  SUPPORTED_DEXS,
  TRANSACTION_TYPE,
} from "src/common/enum";
import {
  BLACKLIST_STRATEGIES_CACHE,
  CONFIG_CACHE,
  REBASED_STRATEGIES_CACHE,
} from "src/common/variables";
import { QueuesProvider } from "src/queues/queues.provider";
import { CustomCache } from "src/config";
import { ContractsService } from "src/contracts/contract.service";
import { PostgresService } from "src/database/postgres.service";
import { SubgraphService } from "src/subgraph/subgraph.service";
import { serializeBigInt } from "src/common/utils";
import { fromI32 } from "src/utils";

@Injectable()
export class BotService {
  private readonly logger: Logger = new Logger(BotService.name);
  private rebasedStrategies: RebasedStrategies;
  private POOL_ADDRESS: string;
  private NFT_ID: number;

  constructor(
    // private readonly subgraphService: SubgraphService,
    // private readonly queueService: QueuesProvider,
    private readonly contractService: ContractsService // private readonly customCache: CustomCache, // private readonly postgresService: PostgresService
  ) {
    this.POOL_ADDRESS =
      "0x2f6341043014bf9ed0fad1bec22b69736adcf355ce2582e46fa6b61f52658e2";
    this.NFT_ID = 4829;
  }

  // async fetchStrategies(configs: ChainConfig) {
  //   try {
  //     if (!configs) {
  //       throw new Error("Config not provided.");
  //     }
  //     this.logger.debug(
  //       `Fetching strategies for chains: ${Object.keys(configs ?? {})}`
  //     );

  //     const allChainsStrategies =
  //       await this.subgraphService.fetchAllChainsStrategies(configs);
  //     const queueArray = allChainsStrategies?.length
  //       ? allChainsStrategies.map((element) => {
  //           this.logger.verbose(
  //             `Queueing strategy assertion for chain: ${element.chainSlug}, DEX: ${element.dex}`
  //           );

  //           this.queueService.assertStrategies(element);
  //         })
  //       : [];
  //     await Promise.all(queueArray);
  //     this.logger.debug("All strategies successfully fetched and queued.");

  //     return true;
  //   } catch (e) {
  //     this.logger.error("Error in fetchStrategies:", {
  //       message: e.message,
  //       stack: e.stack,
  //     });

  //     return false;
  //   }
  // }

  async assertStrategies() {
    try {
      const contract = this.contractService.withProvider();

      let position;
      let pool;
      try {
        // pool = await contract.getPoolInfo(
        //   "0xf4bcb5b665a5728232b33fe97580583049e137d86bdf367d316dc2e9ca6a47"
        // );
        pool = await contract.getPoolInfo(this.POOL_ADDRESS);
      } catch (e) {
        this.logger.error(`failed to fetch pool.`);
      }

      try {
        position = await contract.getPosition(this.NFT_ID);
        // position = await contract.getPosition(36);
      } catch (e) {
        this.logger.error(`failed to fetch posiiton`);
      }

      const currentTick = Number(fromI32(pool.tick));
      const lowerTick = Number(fromI32(position[0].tick_lower));
      const upperTick = Number(fromI32(position[0].tick_upper));

      if (this.isStrategyOutOfRange(currentTick, lowerTick, upperTick)) {
        const { tickLower: newTickLower, tickUpper: newTickUpper } =
          this.calculateNewTicks(
            lowerTick,
            upperTick,
            currentTick,
            Number(pool.tickSpacing)
          );
        console.log("new ticks: ", { newTickLower, newTickUpper });

        const { amount0, amount1 } = await contract.withdrawTransaction(
          this.NFT_ID,
          position[0].liquidity
        );

        await contract.mintTransaction({
          amount0Desired: amount0,
          amount1Desired: amount1,
          fee: pool.fee,
          tickLower: newTickLower,
          tickUpper: newTickUpper,
          token0: pool.token0,
          token1: pool.token1,
        });
      }

      this.logger.debug("All strategies asserted successfully.");

      return true;
    } catch (e) {
      this.logger.error(`Error asserting strategies for chain`, {
        message: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  // async exitStrategies({ strategies, contractAddress, rpc, chain, dex }) {
  //   try {
  //     this.logger.debug(`Auto Exiting for chain: ${chain}, DEX: ${dex}`);
  //     const contract = this.contractService.withProvider(rpc);

  //     const transaction = await contract.exitStrategiesTransaction({
  //       contractAddress,
  //       strategies,
  //     });

  //     const saveTransactionsData = {
  //       chain,
  //       dex,
  //       transactions: transaction,
  //       transactionType: TRANSACTION_TYPE.EXIT,
  //     };

  //     const serializedSaveTransactionsData =
  //       serializeBigInt(saveTransactionsData);

  //     this.logger.debug("Saving executed transactions...");
  //     await this.queueService.saveExecutedTransactions(
  //       serializedSaveTransactionsData
  //     );

  //     return true;
  //   } catch (e) {
  //     this.logger.error(
  //       `Error in exit strategies for chain: ${chain}, DEX: ${dex}`,
  //       {
  //         message: e.message,
  //         stack: e.stack,
  //       }
  //     );
  //     throw e;
  //   }
  // }

  // async rebalanceStrategies({
  //   newRebaseAddress,
  //   newRebaseStrategies,
  //   oldRebaseAddress,
  //   oldRebaseStrategies,
  //   rpc,
  //   chain,
  //   dex,
  // }: IRebalanceStrategyDto) {
  //   try {
  //     this.logger.debug(
  //       `Rebalancing strategies for chain: ${chain}, DEX: ${dex}`
  //     );

  //     const emptyResponse = {
  //       receipt: "",
  //     };
  //     const contract = this.contractService.withProvider(rpc);
  //     const transactionPromise0: Promise<
  //       IRebalanceStrategyTransactionResponse | typeof emptyResponse
  //     > = newRebaseStrategies.length
  //       ? contract.rebalanceStrategiesTransaction({
  //           contractAddress: newRebaseAddress,
  //           isNewRebase: true,
  //           strategies: newRebaseStrategies,
  //         })
  //       : Promise.resolve(emptyResponse);
  //     const transactionPromise1: Promise<
  //       IRebalanceStrategyTransactionResponse | typeof emptyResponse
  //     > = oldRebaseStrategies.length
  //       ? contract.rebalanceStrategiesTransaction({
  //           contractAddress: oldRebaseAddress,
  //           isNewRebase: false,
  //           strategies: oldRebaseStrategies,
  //         })
  //       : Promise.resolve(emptyResponse);

  //     const transactionsResponse = await Promise.all([
  //       transactionPromise0,
  //       transactionPromise1,
  //     ]);
  //     this.logger.debug("Received transaction responses.");

  //     const transactions: IRebalanceStrategyTransactionResponse[] =
  //       transactionsResponse.filter(
  //         (response) => response.receipt !== ""
  //       ) as IRebalanceStrategyTransactionResponse[];

  //     const saveTransactionsData: ISaveTransactionDto = {
  //       chain,
  //       dex,
  //       transactions,
  //       transactionType: TRANSACTION_TYPE.REBALANCE,
  //     };

  //     const serializedSaveTransactionsData =
  //       serializeBigInt(saveTransactionsData);

  //     this.logger.debug("Saving executed transactions...");
  //     await this.queueService.saveExecutedTransactions(
  //       serializedSaveTransactionsData
  //     );

  //     return true;
  //   } catch (e) {
  //     this.logger.error(
  //       `Error in rebalancing strategies for chain: ${chain}, DEX: ${dex}`,
  //       {
  //         message: e.message,
  //         stack: e.stack,
  //       }
  //     );
  //     throw e;
  //   }
  // }

  // async transformAndSaveTransactions({
  //   chain,
  //   dex,
  //   transactions,
  //   transactionType,
  // }: ISaveTransactionDto) {
  //   try {
  //     this.logger.debug(
  //       `Transforming and saving transactions for ${chain}, DEX: ${dex}`
  //     );
  //     const transformedTransactions = transactions.flatMap(
  //       ({
  //         receipt,
  //         strategyId,
  //         maxFeePerGas,
  //         maxPriorityFeePerGas,
  //         gasLimit,
  //         date,
  //       }) => {
  //         const tempTransaction = {
  //           chain,
  //           dex,
  //           txHash: receipt.hash,
  //           blockNumber: receipt.blockNumber.toString(),
  //           from: receipt.from,
  //           to: receipt.to,
  //           maxFeePerGas: maxFeePerGas.toString(),
  //           maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
  //           gasPrice: receipt.gasPrice.toString(),
  //           gasLimit: gasLimit.toString(),
  //           gasUsed: receipt.gasUsed.toString(),
  //           timestamp: date,
  //           success: !!receipt.status,
  //         };
  //         this.logger.verbose(
  //           `Transforming transaction for strategy ID: ${strategyId}`
  //         );

  //         if (!this.rebasedStrategies) {
  //           this.rebasedStrategies = {} as RebasedStrategies;
  //         }

  //         this.rebasedStrategies[chain] = this.rebasedStrategies[chain] || {};
  //         this.rebasedStrategies[chain][dex] =
  //           this.rebasedStrategies[chain][dex] || {};

  //         return strategyId.flatMap((strategy) => {
  //           if (transactionType === TRANSACTION_TYPE.REBALANCE) {
  //             this.rebasedStrategies[chain][dex][strategy] = new Date(
  //               date
  //             ).getTime();
  //           }
  //           return this.postgresService.createTransactions({
  //             strategyId: strategy,
  //             ...tempTransaction,
  //           });
  //         });
  //       }
  //     );
  //     this.logger.verbose(
  //       "checking rebased strategies before saving",
  //       this.rebasedStrategies
  //     );
  //     this.logger.debug("Saving transformed transactions.");
  //     await Promise.all([
  //       this.postgresService.saveTransactions(transformedTransactions),
  //       this.customCache.set(REBASED_STRATEGIES_CACHE, this.rebasedStrategies),
  //     ]);
  //   } catch (e) {
  //     this.logger.error("Error in transforming and saving transactions:", {
  //       message: e.message,
  //       stack: e.stack,
  //     });

  //     throw e;
  //   }
  // }

  // private checkLastRebaseActivityOfStrategy(
  //   chainSlug: string,
  //   dex: string,
  //   strategy: IStrategies,
  //   coolDownPeriod: number
  // ) {
  //   try {
  //     this.logger.debug(
  //       `Checking last rebase activity for strategy ${strategy.id}`
  //     );

  //     if (
  //       !Object.keys(this.rebasedStrategies).length ||
  //       !this.rebasedStrategies[chainSlug] ||
  //       !this.rebasedStrategies[chainSlug][dex] ||
  //       !this.rebasedStrategies[chainSlug][dex][strategy.id]
  //     ) {
  //       return false;
  //     }

  //     const lastRebasedTimestamp =
  //       this.rebasedStrategies[chainSlug][dex][strategy.id];
  //     const coolDownPeriodInMs = coolDownPeriod * 60 * 1000;
  //     const rebaseCoolDown = Date.now() - lastRebasedTimestamp;

  //     if (lastRebasedTimestamp && coolDownPeriodInMs > rebaseCoolDown) {
  //       this.logger.verbose(
  //         `skipping rebase of strategy ${
  //           strategy.id
  //         }, last rebase was at ${new Date(lastRebasedTimestamp).toISOString()}`
  //       );
  //       return true;
  //     }

  //     return false;
  //   } catch (e) {
  //     this.logger.error("error in checking of rebase activity", {
  //       message: e.message,
  //       stack: e.stack,
  //     });
  //     throw e;
  //   }
  // }

  // private isAutoExitTriggerred(strategy: IStrategies, poolCurrentTick: number) {
  //   try {
  //     const lowerTick = Number(strategy.exitStrategies.lowerTick);
  //     const upperTick = Number(strategy.exitStrategies.upperTick);
  //     if (!strategy.isExit) {
  //       this.logger.verbose("strategy not auto exit.");
  //       return false;
  //     }

  //     if (lowerTick === poolCurrentTick || upperTick === poolCurrentTick) {
  //       this.logger.verbose("strategy auto exit triggerred.");
  //       return true;
  //     }

  //     this.logger.verbose("strategy auto exit not triggerred.");
  //     return false;
  //   } catch (e) {
  //     this.logger.error("Error in checking if strategy is auto exit:", {
  //       message: e.message,
  //       stack: e.stack,
  //     });
  //     return false;
  //   }
  // }

  private isStrategyOutOfRange(poolCurrentTick: number, tickLower, tickUpper) {
    try {
      // this.logger.debug(`Checking if strategy ${strategy.id} is out of range.`);

      const parsedTickLower = parseInt(tickLower);
      const parsedTickUpper = parseInt(tickUpper);

      this.logger.verbose("ticks", { tickLower, tickUpper, poolCurrentTick });
      const isOutOfRange = (
        lowerRange: number,
        upperRange: number,
        tick: number
      ): boolean => tick < lowerRange || tick > upperRange;

      if (isOutOfRange(tickLower, tickUpper, poolCurrentTick)) {
        return true;
      }

      return false;
    } catch (e) {
      this.logger.error("Error in checking if strategy is out of range:", {
        message: e.message,
        stack: e.stack,
      });
      return false;
    }
  }

  private calculateNewTicks(
    tickLower: number,
    tickUpper: number,
    currentPoolTick: number,
    tickSpacing: number
  ) {
    const adjustedCurrentTick =
      currentPoolTick - (currentPoolTick % tickSpacing);

    // Calculate the tick spread based on the original tick range
    const tickSpread = Math.abs(tickUpper - tickLower);

    let newTickLower: number;
    let newTickUpper: number;

    if (currentPoolTick > tickUpper) {
      // If the pool tick is above the current position, place new range just below
      newTickUpper = adjustedCurrentTick - tickSpacing;
      newTickLower = newTickUpper - tickSpread;
    } else if (currentPoolTick < tickLower) {
      // If the pool tick is below the current position, place new range just above
      newTickLower = adjustedCurrentTick + tickSpacing;
      newTickUpper = newTickLower + tickSpread;
    } else {
      // If the pool tick is within the existing range, keep it the same
      newTickLower = tickLower;
      newTickUpper = tickUpper;
    }

    return { tickLower: newTickLower, tickUpper: newTickUpper };
  }

  // private isModeValid(
  //   poolCurrentTick: number,
  //   tickLower: number,
  //   tickUpper: number,
  //   mode: number,
  //   isPro: boolean
  // ) {
  //   if (
  //     (mode === 2 && poolCurrentTick > tickUpper) ||
  //     (mode === 1 && poolCurrentTick < tickLower) ||
  //     mode === 3
  //   ) {
  //     return isPro;
  //   }

  //   return false;
  // }
}
