import { Entity, Column, Index } from "typeorm";
import { PrimaryEntity } from "./primary.entity";

@Entity()
export class Transactions extends PrimaryEntity {
  @Index()
  @Column({ type: "varchar", length: 66 })
  txHash: string;

  @Index()
  @Column({ type: "varchar", length: 66 })
  strategyId: string;

  @Index()
  @Column({ type: "varchar" })
  chain: string;

  @Index()
  @Column({ type: "varchar" })
  dex: string;

  @Column({ type: "bigint" })
  blockNumber: string;

  @Index()
  @Column({ type: "varchar", length: 42 })
  from: string;

  @Index()
  @Column({ type: "varchar", length: 42, nullable: true })
  to: string;

  // EIP-1559 Fields
  @Column({ type: "decimal", precision: 78, scale: 0, nullable: true })
  maxFeePerGas: string;

  @Column({ type: "decimal", precision: 78, scale: 0, nullable: true })
  maxPriorityFeePerGas: string;

  // @Column({ type: 'decimal', precision: 78, scale: 0, nullable: true })
  // baseFeePerGas: string;

  // Legacy gasPrice for backward compatibility
  @Column({ type: "decimal", precision: 78, scale: 0, nullable: true })
  gasPrice: string;

  @Column({ type: "bigint" })
  gasLimit: string;

  @Column({ type: "bigint" })
  gasUsed: string;

  // @Column({ type: 'varchar', length: 66, nullable: true })
  // contractAddress: string;

  // @Column({ type: 'text', nullable: true })
  // inputData: string;

//   @Column({ type: "bigint" })
//   nonce: string;

  @Column({ type: "timestamp" })
  timestamp: Date;

  @Column({ type: "boolean", nullable: true, default: null })
  success: boolean | null;
}
