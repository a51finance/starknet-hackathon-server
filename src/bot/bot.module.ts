import { forwardRef, Module } from "@nestjs/common";
import { SubgraphModule } from "src/subgraph/subgraph.module";
import { BotService } from "./bot.service";
import { QueuesModule } from "src/queues/queues.module";
import { ContractModule } from "src/contracts/contract.module";
import { DatabaseModule } from "src/database/database.module";
import { CustomCache } from "src/config";

@Module({
  imports: [
    forwardRef(() => QueuesModule),
    SubgraphModule,
    ContractModule,
    DatabaseModule,
  ],
  providers: [BotService, CustomCache],
  exports: [BotService],
})
export class BotModule {}
