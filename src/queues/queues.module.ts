import {
  AssertionQueueConsumer,
  ExecutionQueueConsumer,
  StartupQueueConsumer,
} from "./queues.consumer";
import { forwardRef, Module } from "@nestjs/common";
import { QueuesProvider } from "./queues.provider";
import { BullModule } from "@nestjs/bull";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import {
  ASSERTION_QUEUE,
  EXECUTION_QUEUE,
  FETCHING_QUEUE,
} from "../common/variables";
import { BotModule } from "src/bot/bot.module";

@Module({
  imports: [
    forwardRef(() => BotModule),
    BullModule.registerQueue({
      name: FETCHING_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
    BullBoardModule.forFeature({
      name: FETCHING_QUEUE,
      adapter: BullAdapter,
    }),
    BullModule.registerQueue({
      name: ASSERTION_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: ASSERTION_QUEUE,
      adapter: BullAdapter,
    }),
    BullModule.registerQueue({
      name: EXECUTION_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: EXECUTION_QUEUE,
      adapter: BullAdapter,
    }),
  ],
  providers: [
    StartupQueueConsumer,
    AssertionQueueConsumer,
    ExecutionQueueConsumer,
    QueuesProvider,
  ],
  exports: [QueuesProvider],
})
export class QueuesModule {}
