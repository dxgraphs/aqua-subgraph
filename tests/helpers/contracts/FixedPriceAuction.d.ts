/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface FixedPriceAuctionInterface extends ethers.utils.Interface {
  functions: {
    "ERC20Withdraw(address,uint256)": FunctionFragment;
    "ETHWithdraw(uint256)": FunctionFragment;
    "allocationMax()": FunctionFragment;
    "allocationMin()": FunctionFragment;
    "buyTokens(uint256)": FunctionFragment;
    "claimTokens()": FunctionFragment;
    "closeAuction()": FunctionFragment;
    "endDate()": FunctionFragment;
    "init(bytes)": FunctionFragment;
    "isClosed()": FunctionFragment;
    "minimumRaise()": FunctionFragment;
    "owner()": FunctionFragment;
    "releaseTokens()": FunctionFragment;
    "secondsRemainingInAuction()": FunctionFragment;
    "startDate()": FunctionFragment;
    "tokenIn()": FunctionFragment;
    "tokenOut()": FunctionFragment;
    "tokenPrice()": FunctionFragment;
    "tokensForSale()": FunctionFragment;
    "tokensPurchased(address)": FunctionFragment;
    "tokensRemaining()": FunctionFragment;
    "tokensSold()": FunctionFragment;
    "withdrawFunds(bytes)": FunctionFragment;
    "withdrawUnsoldFunds()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "ERC20Withdraw",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "ETHWithdraw",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "allocationMax",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "allocationMin",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "buyTokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "claimTokens",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "closeAuction",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "endDate", values?: undefined): string;
  encodeFunctionData(functionFragment: "init", values: [BytesLike]): string;
  encodeFunctionData(functionFragment: "isClosed", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "minimumRaise",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "releaseTokens",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "secondsRemainingInAuction",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "startDate", values?: undefined): string;
  encodeFunctionData(functionFragment: "tokenIn", values?: undefined): string;
  encodeFunctionData(functionFragment: "tokenOut", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenPrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokensForSale",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokensPurchased",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "tokensRemaining",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokensSold",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawFunds",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawUnsoldFunds",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "ERC20Withdraw",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ETHWithdraw",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "allocationMax",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "allocationMin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "buyTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "closeAuction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "endDate", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "init", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isClosed", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "minimumRaise",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "releaseTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "secondsRemainingInAuction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "startDate", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenIn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenOut", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokensForSale",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokensPurchased",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokensRemaining",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokensSold", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawUnsoldFunds",
    data: BytesLike
  ): Result;

  events: {
    "AuctionClosed()": EventFragment;
    "AuctionInitalized(address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256)": EventFragment;
    "NewPurchase(address,uint256)": EventFragment;
    "NewTokenClaim(address,uint256)": EventFragment;
    "NewTokenRelease(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AuctionClosed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionInitalized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewPurchase"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewTokenClaim"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewTokenRelease"): EventFragment;
}

export class FixedPriceAuction extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: FixedPriceAuctionInterface;

  functions: {
    ERC20Withdraw(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "ERC20Withdraw(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    ETHWithdraw(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "ETHWithdraw(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    allocationMax(overrides?: CallOverrides): Promise<[BigNumber]>;

    "allocationMax()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    allocationMin(overrides?: CallOverrides): Promise<[BigNumber]>;

    "allocationMin()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    buyTokens(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "buyTokens(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    claimTokens(overrides?: Overrides): Promise<ContractTransaction>;

    "claimTokens()"(overrides?: Overrides): Promise<ContractTransaction>;

    closeAuction(overrides?: Overrides): Promise<ContractTransaction>;

    "closeAuction()"(overrides?: Overrides): Promise<ContractTransaction>;

    endDate(overrides?: CallOverrides): Promise<[BigNumber]>;

    "endDate()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    init(_data: BytesLike, overrides?: Overrides): Promise<ContractTransaction>;

    "init(bytes)"(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    isClosed(overrides?: CallOverrides): Promise<[boolean]>;

    "isClosed()"(overrides?: CallOverrides): Promise<[boolean]>;

    minimumRaise(overrides?: CallOverrides): Promise<[BigNumber]>;

    "minimumRaise()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    "owner()"(overrides?: CallOverrides): Promise<[string]>;

    releaseTokens(overrides?: Overrides): Promise<ContractTransaction>;

    "releaseTokens()"(overrides?: Overrides): Promise<ContractTransaction>;

    secondsRemainingInAuction(overrides?: CallOverrides): Promise<[BigNumber]>;

    "secondsRemainingInAuction()"(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    startDate(overrides?: CallOverrides): Promise<[BigNumber]>;

    "startDate()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokenIn(overrides?: CallOverrides): Promise<[string]>;

    "tokenIn()"(overrides?: CallOverrides): Promise<[string]>;

    tokenOut(overrides?: CallOverrides): Promise<[string]>;

    "tokenOut()"(overrides?: CallOverrides): Promise<[string]>;

    tokenPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    "tokenPrice()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokensForSale(overrides?: CallOverrides): Promise<[BigNumber]>;

    "tokensForSale()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokensPurchased(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "tokensPurchased(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    tokensRemaining(overrides?: CallOverrides): Promise<[BigNumber]>;

    "tokensRemaining()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokensSold(overrides?: CallOverrides): Promise<[BigNumber]>;

    "tokensSold()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    withdrawFunds(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawFunds(bytes)"(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawUnsoldFunds(overrides?: Overrides): Promise<ContractTransaction>;

    "withdrawUnsoldFunds()"(
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  ERC20Withdraw(
    token: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "ERC20Withdraw(address,uint256)"(
    token: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  ETHWithdraw(
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "ETHWithdraw(uint256)"(
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  allocationMax(overrides?: CallOverrides): Promise<BigNumber>;

  "allocationMax()"(overrides?: CallOverrides): Promise<BigNumber>;

  allocationMin(overrides?: CallOverrides): Promise<BigNumber>;

  "allocationMin()"(overrides?: CallOverrides): Promise<BigNumber>;

  buyTokens(
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "buyTokens(uint256)"(
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  claimTokens(overrides?: Overrides): Promise<ContractTransaction>;

  "claimTokens()"(overrides?: Overrides): Promise<ContractTransaction>;

  closeAuction(overrides?: Overrides): Promise<ContractTransaction>;

  "closeAuction()"(overrides?: Overrides): Promise<ContractTransaction>;

  endDate(overrides?: CallOverrides): Promise<BigNumber>;

  "endDate()"(overrides?: CallOverrides): Promise<BigNumber>;

  init(_data: BytesLike, overrides?: Overrides): Promise<ContractTransaction>;

  "init(bytes)"(
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  isClosed(overrides?: CallOverrides): Promise<boolean>;

  "isClosed()"(overrides?: CallOverrides): Promise<boolean>;

  minimumRaise(overrides?: CallOverrides): Promise<BigNumber>;

  "minimumRaise()"(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  "owner()"(overrides?: CallOverrides): Promise<string>;

  releaseTokens(overrides?: Overrides): Promise<ContractTransaction>;

  "releaseTokens()"(overrides?: Overrides): Promise<ContractTransaction>;

  secondsRemainingInAuction(overrides?: CallOverrides): Promise<BigNumber>;

  "secondsRemainingInAuction()"(overrides?: CallOverrides): Promise<BigNumber>;

  startDate(overrides?: CallOverrides): Promise<BigNumber>;

  "startDate()"(overrides?: CallOverrides): Promise<BigNumber>;

  tokenIn(overrides?: CallOverrides): Promise<string>;

  "tokenIn()"(overrides?: CallOverrides): Promise<string>;

  tokenOut(overrides?: CallOverrides): Promise<string>;

  "tokenOut()"(overrides?: CallOverrides): Promise<string>;

  tokenPrice(overrides?: CallOverrides): Promise<BigNumber>;

  "tokenPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

  tokensForSale(overrides?: CallOverrides): Promise<BigNumber>;

  "tokensForSale()"(overrides?: CallOverrides): Promise<BigNumber>;

  tokensPurchased(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  "tokensPurchased(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  tokensRemaining(overrides?: CallOverrides): Promise<BigNumber>;

  "tokensRemaining()"(overrides?: CallOverrides): Promise<BigNumber>;

  tokensSold(overrides?: CallOverrides): Promise<BigNumber>;

  "tokensSold()"(overrides?: CallOverrides): Promise<BigNumber>;

  withdrawFunds(
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawFunds(bytes)"(
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawUnsoldFunds(overrides?: Overrides): Promise<ContractTransaction>;

  "withdrawUnsoldFunds()"(overrides?: Overrides): Promise<ContractTransaction>;

  callStatic: {
    ERC20Withdraw(
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "ERC20Withdraw(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    ETHWithdraw(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "ETHWithdraw(uint256)"(
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    allocationMax(overrides?: CallOverrides): Promise<BigNumber>;

    "allocationMax()"(overrides?: CallOverrides): Promise<BigNumber>;

    allocationMin(overrides?: CallOverrides): Promise<BigNumber>;

    "allocationMin()"(overrides?: CallOverrides): Promise<BigNumber>;

    buyTokens(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "buyTokens(uint256)"(
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    claimTokens(overrides?: CallOverrides): Promise<void>;

    "claimTokens()"(overrides?: CallOverrides): Promise<void>;

    closeAuction(overrides?: CallOverrides): Promise<void>;

    "closeAuction()"(overrides?: CallOverrides): Promise<void>;

    endDate(overrides?: CallOverrides): Promise<BigNumber>;

    "endDate()"(overrides?: CallOverrides): Promise<BigNumber>;

    init(_data: BytesLike, overrides?: CallOverrides): Promise<void>;

    "init(bytes)"(_data: BytesLike, overrides?: CallOverrides): Promise<void>;

    isClosed(overrides?: CallOverrides): Promise<boolean>;

    "isClosed()"(overrides?: CallOverrides): Promise<boolean>;

    minimumRaise(overrides?: CallOverrides): Promise<BigNumber>;

    "minimumRaise()"(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    "owner()"(overrides?: CallOverrides): Promise<string>;

    releaseTokens(overrides?: CallOverrides): Promise<void>;

    "releaseTokens()"(overrides?: CallOverrides): Promise<void>;

    secondsRemainingInAuction(overrides?: CallOverrides): Promise<BigNumber>;

    "secondsRemainingInAuction()"(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startDate(overrides?: CallOverrides): Promise<BigNumber>;

    "startDate()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokenIn(overrides?: CallOverrides): Promise<string>;

    "tokenIn()"(overrides?: CallOverrides): Promise<string>;

    tokenOut(overrides?: CallOverrides): Promise<string>;

    "tokenOut()"(overrides?: CallOverrides): Promise<string>;

    tokenPrice(overrides?: CallOverrides): Promise<BigNumber>;

    "tokenPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensForSale(overrides?: CallOverrides): Promise<BigNumber>;

    "tokensForSale()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensPurchased(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokensPurchased(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokensRemaining(overrides?: CallOverrides): Promise<BigNumber>;

    "tokensRemaining()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensSold(overrides?: CallOverrides): Promise<BigNumber>;

    "tokensSold()"(overrides?: CallOverrides): Promise<BigNumber>;

    withdrawFunds(_data: BytesLike, overrides?: CallOverrides): Promise<void>;

    "withdrawFunds(bytes)"(
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawUnsoldFunds(overrides?: CallOverrides): Promise<void>;

    "withdrawUnsoldFunds()"(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    AuctionClosed(): EventFilter;

    AuctionInitalized(
      tokenIn: null,
      tokenOut: null,
      tokenPrice: null,
      tokensForSale: null,
      startDate: null,
      endDate: null,
      allocationMin: null,
      allocationMax: null,
      minimumRaise: null
    ): EventFilter;

    NewPurchase(buyer: string | null, amount: BigNumberish | null): EventFilter;

    NewTokenClaim(
      buyer: string | null,
      amount: BigNumberish | null
    ): EventFilter;

    NewTokenRelease(
      buyer: string | null,
      amount: BigNumberish | null
    ): EventFilter;
  };

  estimateGas: {
    ERC20Withdraw(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "ERC20Withdraw(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    ETHWithdraw(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "ETHWithdraw(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    allocationMax(overrides?: CallOverrides): Promise<BigNumber>;

    "allocationMax()"(overrides?: CallOverrides): Promise<BigNumber>;

    allocationMin(overrides?: CallOverrides): Promise<BigNumber>;

    "allocationMin()"(overrides?: CallOverrides): Promise<BigNumber>;

    buyTokens(amount: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    "buyTokens(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    claimTokens(overrides?: Overrides): Promise<BigNumber>;

    "claimTokens()"(overrides?: Overrides): Promise<BigNumber>;

    closeAuction(overrides?: Overrides): Promise<BigNumber>;

    "closeAuction()"(overrides?: Overrides): Promise<BigNumber>;

    endDate(overrides?: CallOverrides): Promise<BigNumber>;

    "endDate()"(overrides?: CallOverrides): Promise<BigNumber>;

    init(_data: BytesLike, overrides?: Overrides): Promise<BigNumber>;

    "init(bytes)"(_data: BytesLike, overrides?: Overrides): Promise<BigNumber>;

    isClosed(overrides?: CallOverrides): Promise<BigNumber>;

    "isClosed()"(overrides?: CallOverrides): Promise<BigNumber>;

    minimumRaise(overrides?: CallOverrides): Promise<BigNumber>;

    "minimumRaise()"(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    "owner()"(overrides?: CallOverrides): Promise<BigNumber>;

    releaseTokens(overrides?: Overrides): Promise<BigNumber>;

    "releaseTokens()"(overrides?: Overrides): Promise<BigNumber>;

    secondsRemainingInAuction(overrides?: CallOverrides): Promise<BigNumber>;

    "secondsRemainingInAuction()"(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startDate(overrides?: CallOverrides): Promise<BigNumber>;

    "startDate()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokenIn(overrides?: CallOverrides): Promise<BigNumber>;

    "tokenIn()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokenOut(overrides?: CallOverrides): Promise<BigNumber>;

    "tokenOut()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokenPrice(overrides?: CallOverrides): Promise<BigNumber>;

    "tokenPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensForSale(overrides?: CallOverrides): Promise<BigNumber>;

    "tokensForSale()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensPurchased(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokensPurchased(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokensRemaining(overrides?: CallOverrides): Promise<BigNumber>;

    "tokensRemaining()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensSold(overrides?: CallOverrides): Promise<BigNumber>;

    "tokensSold()"(overrides?: CallOverrides): Promise<BigNumber>;

    withdrawFunds(_data: BytesLike, overrides?: Overrides): Promise<BigNumber>;

    "withdrawFunds(bytes)"(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawUnsoldFunds(overrides?: Overrides): Promise<BigNumber>;

    "withdrawUnsoldFunds()"(overrides?: Overrides): Promise<BigNumber>;
  };

  populateTransaction: {
    ERC20Withdraw(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "ERC20Withdraw(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    ETHWithdraw(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "ETHWithdraw(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    allocationMax(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "allocationMax()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    allocationMin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "allocationMin()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    buyTokens(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "buyTokens(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    claimTokens(overrides?: Overrides): Promise<PopulatedTransaction>;

    "claimTokens()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    closeAuction(overrides?: Overrides): Promise<PopulatedTransaction>;

    "closeAuction()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    endDate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "endDate()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    init(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "init(bytes)"(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    isClosed(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "isClosed()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    minimumRaise(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "minimumRaise()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "owner()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    releaseTokens(overrides?: Overrides): Promise<PopulatedTransaction>;

    "releaseTokens()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    secondsRemainingInAuction(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "secondsRemainingInAuction()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    startDate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "startDate()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenIn(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokenIn()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenOut(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokenOut()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokenPrice()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokensForSale(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokensForSale()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokensPurchased(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tokensPurchased(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokensRemaining(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokensRemaining()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokensSold(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokensSold()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdrawFunds(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawFunds(bytes)"(
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawUnsoldFunds(overrides?: Overrides): Promise<PopulatedTransaction>;

    "withdrawUnsoldFunds()"(
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}