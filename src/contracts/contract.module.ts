import { Module } from "@nestjs/common";
import { ContractsService } from "./contract.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractModule {}
