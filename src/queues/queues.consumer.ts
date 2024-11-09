import { Process, Processor } from "@nestjs/bull";
import {
  ASSERTION_QUEUE,
  EXECUTION_QUEUE,
  FETCHING_QUEUE,
  SAVE_TRANSACTION_JOB,
} from "../common/variables";
import { Job } from "bull";
import { BotService } from "src/bot/bot.service";
import {
  ChainConfig,
  IFetchAllStrategiesReturnDto,
  IRebalanceStrategyDto,
  ISaveTransactionDto,
} from "../common/types";

@Processor(FETCHING_QUEUE)
export class StartupQueueConsumer {
  constructor(private readonly botService: BotService) {}

  // @Process()
  // async fetchStrategiesConsumer(job: Job<ChainConfig>) {
  //   await this.botService.fetchStrategies(job.data);
  // }
}

@Processor(ASSERTION_QUEUE)
export class AssertionQueueConsumer {
  constructor(private readonly botService: BotService) {}

  // @Process()
  // async assertStrategiesConsumer(job: Job<IFetchAllStrategiesReturnDto>) {
  //   await this.botService.assertStrategies(job.data);
  // }
}

@Processor(EXECUTION_QUEUE)
export class ExecutionQueueConsumer {
  constructor(private readonly botService: BotService) {}

  // @Process()
  // async executeStrategiesConsumer(job: Job<IRebalanceStrategyDto>) {
  //   await this.botService.rebalanceStrategies(job.data);
  // }

  // @Process(SAVE_TRANSACTION_JOB)
  // async saveTransactionsToDB(job: Job<ISaveTransactionDto>) {
  //   await this.botService.transformAndSaveTransactions(job.data);
  // }
}
