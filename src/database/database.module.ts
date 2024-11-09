import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transactions } from "./entities/transactions.entity";
import { PostgresService } from "./postgres.service";

@Module({
  imports: [TypeOrmModule.forFeature([Transactions])],
  providers: [PostgresService],
  exports: [PostgresService],
})
export class DatabaseModule {}
