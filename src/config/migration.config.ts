import { config } from "dotenv";
import { ConfigService } from "@nestjs/config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DataSource } from "typeorm";

import { Env } from "src/common/env";

config();
const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get(Env.DB_HOST),
  port: +configService.get(Env.DB_PORT),
  username: configService.get(Env.DB_USERNAME),
  password: configService.get(Env.DB_PASSWORD),
  database: configService.get(Env.DB_NAME),
  entities: [],
  migrations: ["dist/migrations/*.js"],
  namingStrategy: new SnakeNamingStrategy(),
});
