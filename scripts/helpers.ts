// Externals
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Event } from '@ethersproject/contracts'
import { providers, utils } from 'ethers'
import DayJSUTC from 'dayjs/plugin/utc'
import dayjs from 'dayjs'

// Helpers
import { encodeInitDataFairSale, encodeInitDataFixedPrice, toUTC } from '../tests/helpers'
// Typechained
import {
  FixedPriceSaleTemplate__factory,
  FairSaleTemplate__factory,
  TemplateLauncher,
  FixedPriceSale,
  ERC20Mintable,
  MesaFactory,
  SaleLauncher
} from '../tests/helpers/contracts'

// Interfaces
import { NewPurchase, TemplateAdded } from './interfaces'

export interface CreateSaleOptions {
  templateId: BigNumberish
  mesaFactory: MesaFactory
  saleLauncher: SaleLauncher
  biddingToken: ERC20Mintable
  saleToken: ERC20Mintable
  saleCreator: providers.JsonRpcSigner
}

export interface TokenList {
  [key: string]: ERC20Mintable
}

export interface AddTemplateToLauncherOptions {
  launcher: TemplateLauncher | SaleLauncher
  saleTemplateAddress: string
}

export interface PurchaseTokenOptions {
  fixedPriceSale: FixedPriceSale
  amount: BigNumberish
  signer: providers.JsonRpcSigner
}

// UTC plugin
dayjs.extend(DayJSUTC)

// Time constants
export const ONE_MINUTE = 60
export const ONE_HOUR = ONE_MINUTE * 60

/**
 *
 * @param tokens
 */
export async function printTokens(tokens: TokenList) {
  const values = Object.values(tokens)

  console.log(`Deployed tokens`)
  const debug = await Promise.all(
    values.map(async ({ symbol, name, totalSupply }) => ({
      symbol: await symbol(),
      name: await name(),
      totalSupply: utils.formatEther(await totalSupply())
    }))
  )

  console.table(debug)
}

export function getEvent<T>(event: Event): T {
  if (event.args) {
    return (event.args as any) as T
  }
  return {} as T
}

/**
 * Creates a FairSale
 */
export async function createFairSale({
  templateId,
  mesaFactory,
  saleLauncher,
  biddingToken,
  saleToken,
  saleCreator
}: CreateSaleOptions) {
  const launchFairSaleTemplateTx = await mesaFactory.launchTemplate(
    templateId,
    encodeInitDataFairSale({
      duration: BigNumber.from(ONE_HOUR), // auction lasts for one hour
      minBuyAmount: 10, // Each order's bid must be at least 10
      minPrice: 5, // Minimum price per token
      minRaise: 100000, // 100k DAI
      saleLauncher: saleLauncher.address,
      saleTemplateId: templateId,
      tokenIn: biddingToken.address,
      tokenOut: saleToken.address,
      tokenOutSupply: await saleToken.totalSupply(),
      tokenSupplier: await saleCreator.getAddress()
    })
  )

  const launchTemplateTxReceipt = await launchFairSaleTemplateTx.wait(1)

  if (launchTemplateTxReceipt.events) {
    console.log(launchTemplateTxReceipt.events)
    const launchedTemplateAddress = launchTemplateTxReceipt?.events[0]?.args?.template
    console.log(`Launched a new FairSaleTemplate at ${launchedTemplateAddress}`)
    // Connect to the Template and create the sale
    const saleTemplate = FairSaleTemplate__factory.connect(launchedTemplateAddress, saleCreator)

    console.log('saleTemplateId: ', (await saleTemplate.saleTemplateId()).toNumber)

    try {
      const createSaleTx = await saleTemplate.createSale({
        value: utils.parseEther('1')
      })
      const createSaleTxReceipt = await createSaleTx.wait(1)

      const newSaleAddress = `0x${createSaleTxReceipt.logs[0].topics[1].substring(26)}`
    } catch (e) {
      console.log(`FairSaleTemplate.createSale failed: `, JSON.parse(e.body))
    }
  }
}

/**
 * Deploys a new FixedPriceSale and returns the address
 * @param param0
 */
export async function createFixedPriceSale({
  templateId,
  mesaFactory,
  saleLauncher,
  biddingToken,
  saleToken,
  saleCreator
}: CreateSaleOptions): Promise<string> {
  // Get blocktimestamp from Ganache
  const lastBlock = await getLastBlock(mesaFactory.provider)
  const blockTimestamp = dayjs.utc(lastBlock.timestamp)

  const launchFixedPriceSaleTemplateTxReceipt = await mesaFactory
    .launchTemplate(
      templateId, // FixedPriceSale templateId
      encodeInitDataFixedPrice({
        startDate: blockTimestamp.add(1, 'hours').unix(),
        endDate: blockTimestamp.add(2, 'hours').unix(),
        saleLauncher: saleLauncher.address,
        saleTemplateId: templateId,
        tokenIn: biddingToken.address,
        tokenOut: saleToken.address,
        minimumRaise: 100,
        tokenSupplier: await saleCreator.getAddress(),
        allocationMax: 10,
        allocationMin: 1,
        owner: await saleCreator.getAddress(),
        tokenPrice: 2,
        tokensForSale: await saleToken.totalSupply()
      })
    )
    .then(tx => tx.wait(1))

  if (!launchFixedPriceSaleTemplateTxReceipt.events) {
    throw new Error('Not events found')
  }
  const launchedTemplateAddress = launchFixedPriceSaleTemplateTxReceipt?.events[0]?.args?.template
  console.log(`Launched a new FixedPriceSaleTemplate at ${launchedTemplateAddress}`)
  // Connect to the Template and create the sale
  const saleTemplate = FixedPriceSaleTemplate__factory.connect(launchedTemplateAddress, saleCreator)

  const createSaleTx = await saleTemplate.createSale({
    value: utils.parseEther('1')
  })
  const createSaleTxReceipt = await createSaleTx.wait(1)
  // Extract the newSale from logs
  const newSaleAddress = `0x${createSaleTxReceipt.logs[0].topics[1].substring(26)}`

  return newSaleAddress
}

export async function addSaleTemplateToLauncher({
  launcher,
  saleTemplateAddress
}: AddTemplateToLauncherOptions): Promise<TemplateAdded> {
  const addTemplateTx = await launcher.addTemplate(saleTemplateAddress)
  const addTemplateTxReceipt = await addTemplateTx.wait(1)
  if (addTemplateTxReceipt.events) {
    return getEvent<TemplateAdded>(addTemplateTxReceipt.events[0])
  } else {
    throw new Error('Contract did not emit TemplateAdded')
  }
}

/**
 * Buys tokens from a FixedPriceSale
 * @param param0
 */
export async function purchaseToken({ fixedPriceSale, amount }: PurchaseTokenOptions) {
  const buyTokensTx = await fixedPriceSale.buyTokens(amount)
  const buyTokensReceipt = await buyTokensTx.wait(1)
  if (buyTokensReceipt.events) {
    return getEvent<NewPurchase>(buyTokensReceipt.events[0] as Event)
  } else {
    throw new Error('Contract did not emit NewPurchase')
  }
}

export async function getLastBlock(provider: providers.Provider) {
  const lastBlockNumber = await provider.getBlockNumber()

  return provider.getBlock(lastBlockNumber)
}
