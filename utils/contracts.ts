// Externals
import {
  Event,
  BigNumber,
  ContractFactory,
  Signer,
  providers,
  ethers,
  BigNumberish,
  ContractReceipt,
  utils
} from 'ethers'
import DayJSUTC from 'dayjs/plugin/utc'
import dayjs from 'dayjs'

import { exec as execBase } from 'child_process'

// Contract interfaces and classes
// Encoders
import { encodeInitDataFixedPriceSale, encodeInitDataFairSale } from './encoders'
// Typechained
import { FixedPriceSaleTemplate__factory, FairSaleTemplate__factory } from './typechain-contracts'
import type { ERC20Mintable, AquaFactory, TemplateLauncher, FixedPriceSale, SaleLauncher } from './typechain-contracts'

// Interfaces
import { NewPurchase, TemplateAdded } from './types'
import { ONE_HOUR } from '../utils/constants'
import { getLastBlock } from '../utils/evm'

export interface CreateSaleOptions {
  templateId: BigNumberish
  aquaFactory: AquaFactory
  saleLauncher: SaleLauncher
  biddingToken: ERC20Mintable
  saleToken: ERC20Mintable
  saleCreator: providers.JsonRpcSigner
  participantList?: boolean
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
  aquaFactory,
  saleLauncher,
  biddingToken,
  saleToken,
  saleCreator
}: CreateSaleOptions) {
  const launchSaleTemplateTxReceipt = await aquaFactory
    .launchTemplate(
      templateId,
      encodeInitDataFairSale({
        duration: BigNumber.from(ONE_HOUR), // auction lasts for one hour
        minBuyAmount: utils.parseUnits('10'), // Each order's bid must be at least 10
        minPrice: utils.parseUnits('1'), // Minimum price per token
        minRaise: utils.parseUnits('100000'), // 100k DAI
        saleLauncher: saleLauncher.address,
        saleTemplateId: templateId,
        tokenIn: biddingToken.address,
        tokenOut: saleToken.address,
        tokenOutSupply: await saleToken.totalSupply(),
        tokenSupplier: await saleCreator.getAddress()
      }),
      'explore-metahash'
    )
    .then(tx => tx.wait(1))

  const launchedTemplateAddress = getTemplateAddressFromTransactionReceipt(launchSaleTemplateTxReceipt)

  if (!launchedTemplateAddress) {
    throw new Error('Could not find launched FixedPriceSaleTemplate address')
  }
  console.log(`Launched a new FairSaleTemplate at ${launchedTemplateAddress}`)

  // Connect to the Template and create the sale
  const saleTemplate = FairSaleTemplate__factory.connect(launchedTemplateAddress, saleCreator)

  const createSaleTx = await saleTemplate.createSale({
    value: utils.parseUnits('1')
  })
  const createSaleTxReceipt = await createSaleTx.wait(1)

  const newSaleAddress = `0x${createSaleTxReceipt.logs[0].topics[1].substring(26)}`
  return newSaleAddress
}

/**
 * Deploys a new FixedPriceSale and returns the address
 * @param param0
 */
export async function createFixedPriceSale({
  templateId,
  aquaFactory,
  saleLauncher,
  biddingToken,
  saleToken,
  saleCreator,
  participantList = false
}: CreateSaleOptions): Promise<string> {
  // Get blocktimestamp from Ganache
  const lastBlock = await getLastBlock(aquaFactory.provider)
  // Sale lasts for one hour
  const startDate = lastBlock.timestamp + 180 // 5 minutes from from last block timestamp
  const endDate = startDate + 3600 * 24 // 24 hours from start date

  console.log({
    startDate: new Date(startDate * 1000),
    endDate: new Date(endDate * 1000)
  })

  const launchFixedPriceSaleTemplateTxReceipt = await aquaFactory
    .launchTemplate(
      templateId, // FixedPriceSale templateId
      encodeInitDataFixedPriceSale({
        saleLauncher: saleLauncher.address,
        saleTemplateId: templateId,
        tokenSupplier: await saleCreator.getAddress(),
        startDate,
        endDate,
        tokenIn: biddingToken.address,
        tokenOut: saleToken.address,
        minCommitment: utils.parseUnits('1'),
        maxCommitment: utils.parseUnits('10'),
        minRaise: utils.parseUnits('100'),
        tokenPrice: utils.parseUnits('2'),
        tokensForSale: utils.parseUnits('500'),
        participantList
      }),
      'explore-metahash'
    )
    .then(tx => tx.wait(1))

  const launchedTemplateAddress = getTemplateAddressFromTransactionReceipt(launchFixedPriceSaleTemplateTxReceipt)

  if (!launchedTemplateAddress) {
    throw new Error('Could not find launched FixedPriceSaleTemplate address')
  }
  console.log(`Launched a new FixedPriceSaleTemplate at ${launchedTemplateAddress}`)
  // Connect to the Template and create the sale
  const saleTemplate = FixedPriceSaleTemplate__factory.connect(launchedTemplateAddress, saleCreator)

  const createSaleTx = await saleTemplate.createSale({
    value: utils.parseUnits('1')
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
 */
export async function commitTokens({ fixedPriceSale, amount }: PurchaseTokenOptions) {
  const buyTokensTx = await fixedPriceSale.commitTokens(amount)
  const buyTokensReceipt = await buyTokensTx.wait(1)
  if (buyTokensReceipt.events) {
    return getEvent<NewPurchase>(buyTokensReceipt.events[0] as Event)
  } else {
    throw new Error('Contract did not emit NewPurchase')
  }
}

/**
 * Extracts the Launched <Type>SaleTemplate contract address from
 */
export function getTemplateAddressFromTransactionReceipt(txReceipt: ContractReceipt): string | undefined {
  if (!txReceipt.events) {
    return
  }
  // filter target event by signature
  const templateLaunchedEvent = txReceipt.events.find(event => event.event == 'TemplateLaunched')
  // Attempt to get mapped argument/param
  return templateLaunchedEvent?.args?.template
}

/**
 * Wraps `child_process.exec` in a promise
 * @param command
 */
export function execAsync(command: string) {
  return new Promise<string>((resolve, reject) => {
    return execBase(command, (err, stdut) => {
      if (err) {
        return reject(err)
      }

      return resolve(stdut)
    })
  })
}

export type ContractFactories =
  | 'FairSale'
  | 'AquaFactory'
  | 'ERC20Mintable'
  | 'SaleLauncher'
  | 'TemplateLauncher'
  | 'FixedPriceSale'
  | 'FairSaleTemplate'
  | 'FixedPriceSaleTemplate'
  | 'ParticipantListLauncher'
  | 'ParticipantList'
/**
 * Creates and returns a `ContractFactory` from ethers
 * @param contract the contract name. See `ContractFactories`
 * @param signer the signer that deploys the contract
 */
export function getContractFactory(contract: ContractFactories, signer: Signer) {
  const contractArtifact = require(`../artifacts/${contract}.json`)
  return new ContractFactory(contractArtifact.abi, contractArtifact.bytecode, signer)
}

interface CreateTokensAndMintAndApproveProps {
  name: string
  symbol: string
  numberOfTokens: BigNumberish
  addressToApprove: string
  users: providers.JsonRpcSigner[]
  signer: Signer
}

export async function createTokenAndMintAndApprove({
  name,
  symbol,
  addressToApprove,
  numberOfTokens = BigNumber.from(10).pow(30),
  users,
  signer
}: CreateTokensAndMintAndApproveProps): Promise<ERC20Mintable> {
  const token = (await getContractFactory('ERC20Mintable', signer).deploy(symbol, name)) as ERC20Mintable

  for (const user of users) {
    await token.mint(await user.getAddress(), numberOfTokens)
    await token.connect(user).approve(addressToApprove, ethers.constants.MaxUint256)
  }

  return token
}

interface CreateBiddingTokenAndMintAndApproveProps {
  numberOfTokens: BigNumber
  addressesToApprove?: string[]
  users: providers.JsonRpcSigner[]
  deployer: providers.JsonRpcSigner
}

export async function createBiddingTokenAndMintAndApprove({
  numberOfTokens,
  addressesToApprove,
  users,
  deployer
}: CreateBiddingTokenAndMintAndApproveProps) {
  // Deploy the token
  const biddingToken = (await getContractFactory('ERC20Mintable', deployer).deploy('BT', 'BT')) as ERC20Mintable

  for (const user of users) {
    await biddingToken.mint(user._address, numberOfTokens)
    // Approve each address to spend the token
    if (addressesToApprove) {
      for (const addressToApprove of addressesToApprove) {
        await biddingToken.connect(user).approve(addressToApprove, numberOfTokens)
      }
    }
  }

  return biddingToken
}

export async function createWETH(signer: Signer) {
  // Get factories and deploy BiddingToken and AuctioningToken
  return (await getContractFactory('ERC20Mintable', signer).deploy('WETH', 'WETH')) as ERC20Mintable
}
