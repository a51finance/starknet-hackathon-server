import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { Transactions } from "./entities/transactions.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ISaveTransactionDto } from "src/common/types";

@Injectable()
export class PostgresService {
  private readonly logger: Logger = new Logger(PostgresService.name);
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionRepo: Repository<Transactions>
  ) {}

  async saveTransactions(transactions: Transactions[]) {
    try {
      await this.transactionRepo.insert(transactions);
      this.logger.log(
        `Successfully saved ${transactions.length} transactions.`
      );
    } catch (e) {
      this.logger.error("Error saving transactions", {
        error: e.message,
        transactionCount: transactions.length,
        transactions,
      });
      throw e;
    }
  }

  createTransactions(transactions: any) {
    try {
      return this.transactionRepo.create(transactions);
    } catch (e) {
      this.logger.error("Error saving transactions", {
        error: e.message,
        transactionCount: transactions.length,
        transactions,
      });
      throw e;
    }
  }
}
