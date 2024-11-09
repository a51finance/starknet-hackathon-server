import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "src/common/env";
import { Contract, RpcProvider, Account, cairo, CallData } from "starknet";
import { ABI } from "./abis/nonFungiblePositionManager";
import { POOL_ABI } from "./abis/pool";
import { decimalToHexManual, toI32 } from "src/utils";

@Injectable()
export class ContractsService {
  private wallet: Account;
  private readonly signer: string;
  // private contract: UniswapMulticall;
  private provider: RpcProvider;
  private readonly logger = new Logger(ContractsService.name);
  private providerCache: { [key: string]: RpcProvider } = {};
  private NON_FUNGIBLE_POSITION_MANAGER: string;
  private RPC: string;
  private WALLET_ADDRESS: string;

  constructor(private readonly configService: ConfigService) {
    this.signer = configService.get<string>(Env.SIGNER_KEY);
    this.NON_FUNGIBLE_POSITION_MANAGER =
      "0x024fd9721eea36cf8cebc226fd9414057bbf895b47739822f849f622029f9399"; //sepolia
    // "0x0469b656239972a2501f2f1cd71bf4e844d64b7cae6773aa84c702327c476e5b";
    this.RPC =
      "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/AvIxiYWTJWx6GNbzMwFFcRyl6ZToc_FT"; // sepolia
    // "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/AvIxiYWTJWx6GNbzMwFFcRyl6ZToc_FT";
    this.WALLET_ADDRESS =
      "0x06231D75E86D6db2Be0244Fd6f9F1a7CF39A835BEB44a2c1C56A1e81A5648f66";
  }

  private setProvider(rpc: string) {
    try {
      if (!this.providerCache[rpc]) {
        this.providerCache[rpc] = new RpcProvider({ nodeUrl: rpc });
      }
      this.provider = this.providerCache[rpc];
      this.wallet = new Account(
        this.provider,
        this.WALLET_ADDRESS,
        this.signer
      ); //need to set wallet
      // console.log("address: ", this.wallet.address);
    } catch (e) {
      this.logger.error("error in set provider", {
        message: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  public withProvider(): ContractsService {
    try {
      const instance = new ContractsService(this.configService);
      instance.setProvider(this.RPC);
      return instance;
    } catch (e) {
      this.logger.error("error in with provider", {
        message: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  // private async call(
  //   params: IMultiCallParams[],
  //   blockNumber: number | string = "latest"
  // ) {
  //   try {
  //     const calls: UniswapInterfaceMulticall.CallStruct[] = [];

  //     for (const {
  //       address,
  //       contractInterface,
  //       methodName,
  //       callInputs,
  //     } of params) {
  //       if (!contractInterface || !methodName) {
  //         throw new Error("Missing contract interface or method name");
  //       }

  //       const fragment = contractInterface.getFunction(methodName);
  //       if (!fragment) {
  //         throw new Error(
  //           `Method ${methodName} not found in the contract interface`
  //         );
  //       }

  //       callInputs.forEach((callInput) => {
  //         const callData = contractInterface.encodeFunctionData(
  //           fragment,
  //           callInput
  //         );
  //         if (callData) {
  //           calls.push({
  //             target: address,
  //             callData,
  //             gasLimit: DEFAULT_CALL_GAS_REQUIRED,
  //           });
  //         }
  //       });
  //     }

  //     const { returnData } = await this.contract.multicall.staticCall(calls, {
  //       blockTag: blockNumber,
  //     });

  //     return returnData.map((result, i) => {
  //       const { returnData: data, success, gasUsed } = result;
  //       const { contractInterface, methodName } = params[i];
  //       const fragment = contractInterface.getFunction(methodName);

  //       const decodedResult = contractInterface.decodeFunctionResult(
  //         fragment,
  //         data
  //       );
  //       return {
  //         result: decodedResult,
  //         success,
  //         gasUsed,
  //       };
  //     });
  //   } catch (e) {
  //     this.logger.error(`Error during multicall:`, {
  //       message: e.message,
  //       stack: e.stack,
  //     });
  //     throw e;
  //   }
  // }

  // async multicall(
  //   contractAddress: string,
  //   params: IMultiCallParams[],
  //   blockNumber: number | string = "latest"
  // ) {
  //   try {
  //     this.contract = UniswapMulticall__factory.connect(
  //       contractAddress,
  //       this.provider
  //     );
  //     return this.call(params, blockNumber);
  //   } catch (e) {
  //     this.logger.error("error in muticall ", {
  //       message: e.message,
  //       stack: e.stack,
  //     });
  //   }
  // }

  // async approveToken(tokenAddress, spender, amount) {
  //   try {
  //     const myTestContract = new Contract(ERC20ABI, tokenAddress, this.wallet).typedv2(ERC20ABI);

  //     const uint256AmountToApprove = cairo.uint256(amount.toString());

  //     const approveArgs = {
  //       spender,
  //       amount: { type: "struct", ...uint256AmountToApprove },
  //     };
  //     const contractCallData = new CallData(ERC20ABI);
  //     const approveCalldata = contractCallData.compile("approve", approveArgs);
  //     const approveCall: Call = {
  //       contractAddress: tokenAddress,
  //       entrypoint: 'approve',
  //       calldata: approveCalldata,
  //     }
  //     // Interaction with the contract with call
  //     const res = await myTestContract.app;
  //     const receipt = await this.provider.waitForTransaction(res)
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  async getPoolInfo(poolAddress: string) {
    try {
      const contract = new Contract(
        POOL_ABI,
        poolAddress,
        this.provider
      ).typedv2(POOL_ABI);

      const [tick, fee, token0, token1, tickSpacing] = await Promise.all([
        contract.get_tick(),
        contract.get_fee(),
        contract.get_token0(),
        contract.get_token1(),
        contract.get_tick_spacing(),
      ]);
      console.log("pool info: ", {
        token0: decimalToHexManual(token0),
        token1,
        fee,
        tick,
      });
      return {
        token0: `0x${decimalToHexManual(token0)}`,
        token1: `0x${decimalToHexManual(token1)}`,
        fee,
        tick,
        tickSpacing,
      };
    } catch (e) {
      this.logger.error(`Error during twap:`, {
        message: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  async getPosition(id: number) {
    try {
      const contract = new Contract(
        ABI,
        this.NON_FUNGIBLE_POSITION_MANAGER,
        this.provider
      ).typedv2(ABI);

      const position = await contract.get_position(cairo.uint256(id));
      console.log("position: ", position);
      return position;
    } catch (e) {
      console.log("err: ", e);
      throw e;
    }
  }

  async getTransactionEvents(transactionHash) {
    const receipt = await this.provider.waitForTransaction(transactionHash);

    if (receipt.isSuccess()) {
      const listEvents = receipt.events;

      console.log("No events found for this transaction.");
      return listEvents;
    }

    return;
  }

  async withdrawTransaction(tokenId, liquidity) {
    try {
      const contract = new Contract(
        ABI,
        this.NON_FUNGIBLE_POSITION_MANAGER,
        this.wallet
      ).typedv2(ABI);

      // const [transactionParams, gasEstimation] = await Promise.all([
      //   this.generateFeeData(),
      //   contract.executeExit.estimateGas(strategies),
      // ]);

      // transactionParams.gasLimit = gasEstimation;
      console.log("info: ", liquidity);

      const deadline = Math.floor(new Date().getTime() / 1000) + 1000;

      const callData = CallData.compile({
        token_id: cairo.uint256(tokenId),
        liquidity: BigInt(liquidity.toString()),
        amount0_min: cairo.uint256(0),
        amount1_min: cairo.uint256(0),
        deadline: cairo.felt(deadline),
      });

      console.log("calldata: ", callData);

      const myCall = contract.populate("decrease_liquidity", callData);
      console.log("my call: ", myCall);
      const transaction = await contract.decrease_liquidity(myCall.calldata);

      console.log("transaction: ", transaction);
      const receipt = await this.provider.waitForTransaction(
        transaction.transaction_hash
      );
      console.log("receipt: ", receipt);
      const events = contract.parseEvents(receipt);
      console.log("events: ", events);
      const decreaseInfo =
        events[0][
          "jediswap_v2_periphery::jediswap_v2_nft_position_manager::JediSwapV2NFTPositionManager::DecreaseLiquidity"
        ];

      const returnObj = {
        tokenId: decreaseInfo.token_id,
        liquidity: decreaseInfo.liquidity,
        amount0: decreaseInfo.amount0,
        amount1: decreaseInfo.amount1,
      };

      return returnObj;
    } catch (e) {
      this.logger.error(`Error in withdraw transaction for contract`, {
        message: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  async mintTransaction({
    tickLower,
    tickUpper,
    token0,
    token1,
    fee,
    amount0Desired,
    amount1Desired,
  }) {
    try {
      const contract = new Contract(
        ABI,
        this.NON_FUNGIBLE_POSITION_MANAGER,
        this.wallet
      ).typedv2(ABI);

      const deadline = Math.floor(new Date().getTime() / 1000) + 1000;
      // const [transactionParams, gasEstimation] = await Promise.all([
      //   this.generateFeeData(),
      //   contract.executeExit.estimateGas(strategies),
      // ]);

      // transactionParams.gasLimit = gasEstimation;
      const amount0Min = Math.floor(
        parseFloat((BigInt(amount0Desired) / BigInt(10)).toString())
      );
      const amount1Min = Math.floor(
        parseFloat((BigInt(amount1Desired) / BigInt(10)).toString())
      );

      const mintData = {
        token0,
        token1,
        fee,
        tick_lower: toI32(tickLower),
        tick_upper: toI32(tickUpper),
        amount0_desired: cairo.uint256(amount0Desired.toString()),
        amount1_desired: cairo.uint256(amount1Desired.toString()),
        amount0_min: cairo.uint256(amount0Min.toString()),
        amount1_min: cairo.uint256(amount1Min.toString()),
        recipient: this.wallet.address,
        deadline: cairo.felt(deadline.toString()),
      };
      console.log("mint data: ", mintData);
      const mintCallData = CallData.compile(mintData);

      const myCall = contract.populate("mint", mintCallData);
      console.log("my call: ", myCall);

      const transaction = await contract.mint(myCall.calldata);
      console.log("transaction: ", transaction);
      const receipt = await this.provider.waitForTransaction(
        transaction.transaction_hash
      );
      console.log("receipt: ", receipt);

      const events = contract.parseEvents(receipt);
      console.log("events: ", events);

      return true;
      // return this.generateTransactionResponse(
      //   transaction,
      //   transactionParams,
      //   strategies
      // );
    } catch (e) {
      this.logger.error(`Error in mint transaction`, {
        message: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  // async rebalanceStrategiesTransaction({
  //   isNewRebase,
  //   contractAddress,
  //   strategies,
  // }: IRebalanceStrategyTransaction): Promise<IRebalanceStrategyTransactionResponse> {
  //   try {
  //     const contract = isNewRebase
  //       ? NewRebaseModule__factory.connect(contractAddress, this.wallet)
  //       : RebaseModules__factory.connect(contractAddress, this.wallet);

  //     const [transactionParams, gasEstimation] = await Promise.all([
  //       this.generateFeeData(),
  //       contract.executeStrategies.estimateGas(strategies),
  //     ]);

  //     transactionParams.gasLimit = gasEstimation;

  //     const transaction = await contract.executeStrategies(
  //       strategies,
  //       transactionParams
  //     );

  //     return this.generateTransactionResponse(
  //       transaction,
  //       transactionParams,
  //       strategies
  //     );
  //   } catch (e) {
  //     this.logger.error(
  //       `Error in rebalance transaction for contract ${contractAddress}:`,
  //       {
  //         message: e.message,
  //         stack: e.stack,
  //       }
  //     );
  //     throw e;
  //   }
  // }

  async getBlock(blockNumber: number) {
    try {
      return this.provider.getBlock(blockNumber);
    } catch (e) {
      this.logger.error("error in get block ", {
        message: e.message,
        stack: e.stack,
      });
    }
  }

  // private async generateFeeData() {
  //   try {
  //     const feeData = await this.provider.getFeeData();

  //     const transactionParams: ITransactionOverrideParams = {
  //       from: this.wallet.address,
  //       gasLimit: BigInt(0),
  //       maxFeePerGas: BigInt(0),
  //       maxPriorityFeePerGas: BigInt(0),
  //       gasPrice: BigInt(0),
  //     };

  //     if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
  //       transactionParams.maxFeePerGas = feeData.maxFeePerGas;
  //       transactionParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
  //       delete transactionParams.gasPrice;
  //     } else if (feeData.gasPrice) {
  //       transactionParams.gasPrice = feeData.gasPrice;
  //       delete transactionParams.maxFeePerGas;
  //       delete transactionParams.maxPriorityFeePerGas;
  //     } else {
  //       throw new Error("Unable to fetch gas price data");
  //     }

  //     return transactionParams;
  //   } catch (e) {
  //     this.logger.error("error in generating Fee ", {
  //       message: e.message,
  //       stack: e.stack,
  //     });
  //   }
  // }

  // private async generateTransactionResponse(
  //   transaction: ContractTransactionResponse,
  //   transactionParams: ITransactionOverrideParams,
  //   strategies: string[]
  // ) {
  //   try {
  //     const [receipt, block] = await Promise.all([
  //       transaction.wait(),
  //       transaction.getBlock(),
  //     ]);
  //     const response = {
  //       receipt,
  //       ...transactionParams,
  //       strategyId: strategies,
  //       date: block.date,
  //     };
  //     return response;
  //   } catch (e) {
  //     this.logger.error("error in generating transaction reponse ", {
  //       message: e.message,
  //       stack: e.stack,
  //     });
  //   }
  // }
}
