import { Module } from "@nestjs/common";
import { CustomCache } from "src/config";
import { CronService } from "./cron.service";
import { QueuesModule } from "src/queues/queues.module";
import { ScheduleModule } from "@nestjs/schedule";
import { BotService } from "src/bot/bot.service";
import { ContractsService } from "src/contracts/contract.service";

@Module({
  imports: [ScheduleModule.forRoot(), QueuesModule],
  providers: [CronService, CustomCache, BotService, ContractsService],
  exports: [CronService],
})
export class CronModule {}
