import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { ContractModule } from "./contracts/contract.module";
import { SubgraphModule } from "./subgraph/subgraph.module";
import { BotModule } from "./bot/bot.module";
import { CronModule } from "./cron/cron.module";
import { SentryModule, SentryGlobalFilter } from "@sentry/nestjs/setup";
import { QueuesModule } from "./queues/queues.module";
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { CacheModule } from "@nestjs/cache-manager";
import { APP_FILTER } from "@nestjs/core";
import { BULL_BOARD_ROUTE } from "./common/variables";
import {
  bullModuleAsyncOptions,
  configModuleOptions,
  CustomCache,
  RedisOptions,
  typeormModuleAsyncOptions,
} from "./config";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync(typeormModuleAsyncOptions),
    CacheModule.registerAsync(RedisOptions),
    BullModule.forRootAsync(bullModuleAsyncOptions),
    BullBoardModule.forRoot({
      route: BULL_BOARD_ROUTE,
      adapter: ExpressAdapter,
    }),
    DatabaseModule,
    ContractModule,
    SubgraphModule,
    BotModule,
    CronModule,
    QueuesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
    CustomCache,
  ],
})
export class AppModule {}
