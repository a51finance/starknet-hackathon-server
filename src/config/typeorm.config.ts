import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Env } from "src/common/env";
import { ENTITIES } from "src/database/entities";

export const typeormModuleAsyncOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService
  ): Promise<TypeOrmModuleOptions> => ({
    type: "postgres",
    host: configService.get<string>(Env.DB_HOST),
    port: +configService.get<number>(Env.DB_PORT),
    username: configService.get<string>(Env.DB_USERNAME),
    password: configService.get<string>(Env.DB_PASSWORD),
    database: configService.get<string>(Env.DB_NAME),
    entities: ENTITIES,
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
  }),
  inject: [ConfigService],
};
