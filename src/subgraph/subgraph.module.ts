import { Module } from "@nestjs/common";
import { SubgraphService } from "./subgraph.service";
import { CustomCache } from "src/config";

@Module({
  providers: [SubgraphService, CustomCache],
  exports: [SubgraphService],
})
export class SubgraphModule {}
