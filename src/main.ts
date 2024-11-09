import "./config/sentry.config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Env } from "./common/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>(Env.PORT);

  await app.listen(port, () => {
    console.log(`listenting on PORT ${port}`);
  });
}
bootstrap();
