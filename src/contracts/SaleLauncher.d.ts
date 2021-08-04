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
  PayableOverrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface SaleLauncherInterface extends ethers.utils.Interface {
  functions: {
    "addTemplate(address)": FunctionFragment;
    "createSale(uint256,address,uint256,address,bytes)": FunctionFragment;
    "factory()": FunctionFragment;
    "getDepositAmountWithFees(uint256)": FunctionFragment;
    "getTemplate(uint256)": FunctionFragment;
    "getTemplateId(address)": FunctionFragment;
    "numberOfSales()": FunctionFragment;
    "removeTemplate(uint256)": FunctionFragment;
    "saleInfo(address)": FunctionFragment;
    "saleTemplateId()": FunctionFragment;
    "sales(uint256)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "addTemplate", values: [string]): string;
  encodeFunctionData(
    functionFragment: "createSale",
    values: [BigNumberish, string, BigNumberish, string, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getDepositAmountWithFees",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTemplate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTemplateId",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "numberOfSales",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeTemplate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "saleInfo", values: [string]): string;
  encodeFunctionData(
    functionFragment: "saleTemplateId",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "sales", values: [BigNumberish]): string;

  decodeFunctionResult(
    functionFragment: "addTemplate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "createSale", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDepositAmountWithFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTemplate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTemplateId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "numberOfSales",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeTemplate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "saleInfo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "saleTemplateId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sales", data: BytesLike): Result;

  events: {
    "SaleInitialized(address,uint256,address,bytes)": EventFragment;
    "SaleLaunched(address,uint256)": EventFragment;
    "TemplateAdded(address,uint256)": EventFragment;
    "TemplateRemoved(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "SaleInitialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SaleLaunched"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TemplateAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TemplateRemoved"): EventFragment;
}

export class SaleLauncher extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: SaleLauncherInterface;

  functions: {
    addTemplate(
      _template: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "addTemplate(address)"(
      _template: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    createSale(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    "createSale(uint256,address,uint256,address,bytes)"(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    factory(overrides?: CallOverrides): Promise<[string]>;

    "factory()"(overrides?: CallOverrides): Promise<[string]>;

    getDepositAmountWithFees(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "getDepositAmountWithFees(uint256)"(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getTemplate(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { template: string }>;

    "getTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { template: string }>;

    getTemplateId(
      _template: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "getTemplateId(address)"(
      _template: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    numberOfSales(overrides?: CallOverrides): Promise<[BigNumber]>;

    "numberOfSales()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    removeTemplate(
      _templateId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "removeTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    saleInfo(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        exists: boolean;
        templateId: BigNumber;
        index: BigNumber;
      }
    >;

    "saleInfo(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        exists: boolean;
        templateId: BigNumber;
        index: BigNumber;
      }
    >;

    saleTemplateId(overrides?: CallOverrides): Promise<[BigNumber]>;

    "saleTemplateId()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    sales(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;

    "sales(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  addTemplate(
    _template: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "addTemplate(address)"(
    _template: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  createSale(
    _templateId: BigNumberish,
    _token: string,
    _tokenSupply: BigNumberish,
    _tokenSupplier: string,
    _data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  "createSale(uint256,address,uint256,address,bytes)"(
    _templateId: BigNumberish,
    _token: string,
    _tokenSupply: BigNumberish,
    _tokenSupplier: string,
    _data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  factory(overrides?: CallOverrides): Promise<string>;

  "factory()"(overrides?: CallOverrides): Promise<string>;

  getDepositAmountWithFees(
    _tokenSupply: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getDepositAmountWithFees(uint256)"(
    _tokenSupply: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getTemplate(
    _templateId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "getTemplate(uint256)"(
    _templateId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  getTemplateId(
    _template: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getTemplateId(address)"(
    _template: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  numberOfSales(overrides?: CallOverrides): Promise<BigNumber>;

  "numberOfSales()"(overrides?: CallOverrides): Promise<BigNumber>;

  removeTemplate(
    _templateId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "removeTemplate(uint256)"(
    _templateId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  saleInfo(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [boolean, BigNumber, BigNumber] & {
      exists: boolean;
      templateId: BigNumber;
      index: BigNumber;
    }
  >;

  "saleInfo(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [boolean, BigNumber, BigNumber] & {
      exists: boolean;
      templateId: BigNumber;
      index: BigNumber;
    }
  >;

  saleTemplateId(overrides?: CallOverrides): Promise<BigNumber>;

  "saleTemplateId()"(overrides?: CallOverrides): Promise<BigNumber>;

  sales(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  "sales(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    addTemplate(
      _template: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "addTemplate(address)"(
      _template: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createSale(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    "createSale(uint256,address,uint256,address,bytes)"(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    factory(overrides?: CallOverrides): Promise<string>;

    "factory()"(overrides?: CallOverrides): Promise<string>;

    getDepositAmountWithFees(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getDepositAmountWithFees(uint256)"(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTemplate(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "getTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getTemplateId(
      _template: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTemplateId(address)"(
      _template: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numberOfSales(overrides?: CallOverrides): Promise<BigNumber>;

    "numberOfSales()"(overrides?: CallOverrides): Promise<BigNumber>;

    removeTemplate(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "removeTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    saleInfo(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        exists: boolean;
        templateId: BigNumber;
        index: BigNumber;
      }
    >;

    "saleInfo(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        exists: boolean;
        templateId: BigNumber;
        index: BigNumber;
      }
    >;

    saleTemplateId(overrides?: CallOverrides): Promise<BigNumber>;

    "saleTemplateId()"(overrides?: CallOverrides): Promise<BigNumber>;

    sales(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

    "sales(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    SaleInitialized(
      sale: string | null,
      templateId: null,
      template: string | null,
      data: null
    ): EventFilter;

    SaleLaunched(sale: string | null, templateId: null): EventFilter;

    TemplateAdded(template: string | null, templateId: null): EventFilter;

    TemplateRemoved(template: string | null, templateId: null): EventFilter;
  };

  estimateGas: {
    addTemplate(_template: string, overrides?: Overrides): Promise<BigNumber>;

    "addTemplate(address)"(
      _template: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    createSale(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    "createSale(uint256,address,uint256,address,bytes)"(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    factory(overrides?: CallOverrides): Promise<BigNumber>;

    "factory()"(overrides?: CallOverrides): Promise<BigNumber>;

    getDepositAmountWithFees(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getDepositAmountWithFees(uint256)"(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTemplate(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTemplateId(
      _template: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTemplateId(address)"(
      _template: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numberOfSales(overrides?: CallOverrides): Promise<BigNumber>;

    "numberOfSales()"(overrides?: CallOverrides): Promise<BigNumber>;

    removeTemplate(
      _templateId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "removeTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    saleInfo(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "saleInfo(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    saleTemplateId(overrides?: CallOverrides): Promise<BigNumber>;

    "saleTemplateId()"(overrides?: CallOverrides): Promise<BigNumber>;

    sales(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    "sales(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addTemplate(
      _template: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "addTemplate(address)"(
      _template: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    createSale(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    "createSale(uint256,address,uint256,address,bytes)"(
      _templateId: BigNumberish,
      _token: string,
      _tokenSupply: BigNumberish,
      _tokenSupplier: string,
      _data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "factory()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getDepositAmountWithFees(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getDepositAmountWithFees(uint256)"(
      _tokenSupply: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTemplate(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTemplateId(
      _template: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTemplateId(address)"(
      _template: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numberOfSales(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "numberOfSales()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeTemplate(
      _templateId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "removeTemplate(uint256)"(
      _templateId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    saleInfo(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "saleInfo(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    saleTemplateId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "saleTemplateId()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    sales(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "sales(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}