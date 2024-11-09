import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import {
  ASSERTION_QUEUE,
  EXECUTION_QUEUE,
  FETCHING_QUEUE,
  SAVE_TRANSACTION_JOB,
} from "../common/variables";
import { InjectQueue } from "@nestjs/bull";
import {
  ChainConfig,
  IFetchAllStrategiesReturnDto,
  IRebalanceStrategyDto,
  ISaveTransactionDto,
} from "../common/types";

@Injectable()
export class QueuesProvider {
  constructor(
    @InjectQueue(FETCHING_QUEUE) private fetchingQueue: Queue,
    @InjectQueue(ASSERTION_QUEUE) private assertionQueue: Queue,
    @InjectQueue(EXECUTION_QUEUE) private executionQueue: Queue
  ) {}

  async fetchStrategies(data: ChainConfig) {
    await this.fetchingQueue.add(data);
  }

  async assertStrategies(data: IFetchAllStrategiesReturnDto) {
    await this.assertionQueue.add(data);
  }

  async executeStrategies(data: IRebalanceStrategyDto) {
    await this.executionQueue.add(data);
  }

  async saveExecutedTransactions(data: ISaveTransactionDto) {
    await this.executionQueue.add(SAVE_TRANSACTION_JOB, data, {});
  }
}
