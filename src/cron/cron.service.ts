import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CONFIG_CACHE } from "src/common/variables";
import { QueuesProvider } from "src/queues/queues.provider";
import { CustomCache } from "src/config";
import { ChainConfig } from "src/common/types";
import { BotService } from "src/bot/bot.service";

@Injectable()
export class CronService {
  private readonly logger: Logger = new Logger(CronService.name);
  private static readonly EVERY_2_MINUTES: string = "*/2 * * * *";

  constructor(
    private readonly queueService: QueuesProvider,
    private readonly customCache: CustomCache,
    private readonly botService: BotService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchStrategiesPeriodically() {
    try {
      await this.botService.assertStrategies();
    } catch (e) {
      this.logger.error("Error while pushing job to queue:", {
        message: e.message,
        stack: e.stack,
      });
    }
  }
}
