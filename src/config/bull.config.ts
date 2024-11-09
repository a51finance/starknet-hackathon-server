import { Env } from "src/common/env";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModuleOptions, SharedBullAsyncConfiguration } from "@nestjs/bull";

export const bullModuleAsyncOptions: SharedBullAsyncConfiguration = {
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService
  ): Promise<BullModuleOptions> => ({
    redis: {
      host: configService.get<string>(Env.REDIS_HOST),
      port: +configService.get<number>(Env.REDIS_PORT),
      // password: 'redispw',
      db: configService.get<number>(Env.REDIS_DB),
      keyPrefix: configService.get<string>(Env.PROJECT_NAME),
    },
  }),
  inject: [ConfigService],
};
