// Externals
import { BigInt, Address, log } from '@graphprotocol/graph-ts'
// Contract Types and ABIs
import { FixedPriceSale as FixedPriceSaleContract } from '../../generated/FixedPriceSale/FixedPriceSale'
import { FairSale as FairSaleContract } from '../../generated/FairSale/FairSale'
import { TemplateLauncher as TemplateLauncherContract } from '../../generated/TemplateLauncher/TemplateLauncher'
import { SaleInitialized } from '../../generated/SaleLauncher/SaleLauncher'
import { FairSale, FixedPriceSale } from '../../generated/templates'

// Helpers
import { SALE_STATUS, getOrCreateSaleToken, BID_STATUS } from '../helpers/sales'
import { getSaleTemplateById, SALE_TEMPLATES } from '../helpers/templates'
import { FixedPriceSaleSaleInfo } from '../helpers/fixedPriceSale'
import { getAquaFactory } from '../helpers/factory'

// GraphQL schemas
import * as Schemas from '../../generated/schema'
/**
 * Handle initializing an (Easy|FixedPrice)Sale via `SaleLauncher.createSale`
 * Determines the sale mechanism from `event.params.templateId` and
 * dispatches the event to appropriate handler
 */
export function handleSaleInitialized(event: SaleInitialized): void {
  let saleTemplate = getSaleTemplateById(event.params.templateId.toString())
  // Template does not exist, exit
  if (!saleTemplate) {
    return
  }

  if (saleTemplate.name == SALE_TEMPLATES.FAIR_SALE) {
    FairSale.create(event.params.sale)
    registerFairSale(event)
  }
  if (saleTemplate.name == SALE_TEMPLATES.FIXED_PRICE_SALE) {
    FixedPriceSale.create(event.params.sale)
    registerFixedPriceSale(event)
  }

  // update saleCount on factory
  let factory = getAquaFactory()
  factory.saleCount = ++factory.saleCount
  factory.save()
}

/**
 * Creates a new FairSale entity from
 */
function registerFairSale(event: SaleInitialized): Schemas.FairSale {
  // Bind Template launcher
  // Bind the new Contract
  let fairSaleContract = FairSaleContract.bind(event.params.sale)
  // Create new EasySale entity
  let fairSale = new Schemas.FairSale(event.params.sale.toHexString())
  // Timestamps
  fairSale.createdAt = event.block.timestamp.toI32()
  fairSale.updatedAt = event.block.timestamp.toI32()
  fairSale.minBidAmount = fairSaleContract.minimumBiddingAmountPerOrder()
  // Start and end dates of the sale
  fairSale.startDate = event.block.timestamp.toI32()
  fairSale.endDate = fairSaleContract.auctionEndDate().toI32()
  // Sale status
  fairSale.status = SALE_STATUS.UPCOMING
  // Amount of tokens saled
  fairSale.tokensForSale = new BigInt(0)
  // Bidding token / token in
  let tokenIn = getOrCreateSaleToken(fairSaleContract.tokenIn())
  // Saleing token / token out
  let tokenOut = getOrCreateSaleToken(fairSaleContract.tokenOut())
  // Update assign tokenIn and TokenOut foregin keys
  fairSale.tokenIn = tokenIn.id
  fairSale.tokenOut = tokenOut.id
  // Sale name
  fairSale.name = tokenOut.name || ''

  {
    let fairSaleUserId = event.address.toHexString() + '/users/1' // The first user is always 1
    // Register the FairSaleUser
    // A predictable key is <saleAddress>-<userId>
    let fairSaleUser = new Schemas.FairSaleUser(fairSaleUserId)
    fairSaleUser.createdAt = event.block.timestamp.toI32()
    fairSaleUser.updatedAt = event.block.timestamp.toI32()
    fairSaleUser.address = event.transaction.from
    fairSaleUser.ownerId = 1
    fairSaleUser.sale = event.params.sale.toString()
    fairSaleUser.save()

    // Store/save the first order/bid
    // This order has preditable values
    // owner(Id) is always 1 because the contract registers ID
    // tokenInAmount is the amount offered in the sale
    // tokenOutAmount is the
    let fairSaleBid = new Schemas.FairSaleBid(event.address.toHexString() + '/bids/1') // predictable
    fairSaleBid.createdAt = event.block.timestamp.toI32()
    fairSaleBid.updatedAt = event.block.timestamp.toI32()
    fairSaleBid.tokenInAmount = new BigInt(0)
    fairSaleBid.tokenOutAmount = fairSaleContract.minimumBiddingAmountPerOrder()
    fairSaleBid.status = BID_STATUS.SUBMITTED
    // Update ref of FairSaleUser to ownerId
    fairSaleBid.owner = fairSaleUserId // first bid is FairSaleUse always from the owner
    fairSaleBid.sale = event.params.sale.toHexString()
    // Save the bid to the database
    fairSaleBid.save()
    // Save the sale
  }

  fairSale.save()

  return fairSale
}

/**
 * Creates a new FixedPriceSale entity
 */
function registerFixedPriceSale(event: SaleInitialized): Schemas.FixedPriceSale {
  // Bind Template launcher
  // Bind the new Contract
  let fixedPriceSaleContract = FixedPriceSaleContract.bind(event.params.sale)
  // Create new EasySale entity
  let fixedPriceSale = new Schemas.FixedPriceSale(event.params.sale.toHexString())
  // Fetch sale info and deconstruct it
  let saleInfo = FixedPriceSaleSaleInfo.fromResult(fixedPriceSaleContract.saleInfo())
  // Get launched template data to find metadata ipfs hash
  // Timestamps
  fixedPriceSale.createdAt = event.block.timestamp.toI32()
  fixedPriceSale.updatedAt = event.block.timestamp.toI32()
  // Token price and amount
  fixedPriceSale.tokenPrice = saleInfo.tokenPrice
  fixedPriceSale.sellAmount = saleInfo.tokensForSale
  fixedPriceSale.soldAmount = new BigInt(0)
  // Minimum raise amount
  fixedPriceSale.minRaise = saleInfo.minRaise
  // // Mnimum and maximum tokens per order
  fixedPriceSale.minCommitment = saleInfo.minCommitment
  fixedPriceSale.maxCommitment = saleInfo.maxCommitment
  // Start and end dates of the sale
  fixedPriceSale.startDate = saleInfo.startDate.toI32()
  fixedPriceSale.endDate = saleInfo.endDate.toI32()
  // Sale status
  fixedPriceSale.status = SALE_STATUS.UPCOMING
  fixedPriceSale.hasParticipantList = saleInfo.hasParticipantList
  if (saleInfo.hasParticipantList) {
    // Reference the participantList entity
    fixedPriceSale.participantList = saleInfo.participantList.toHexString()
  }
  // Bidding token / token in
  let tokenIn = getOrCreateSaleToken(saleInfo.tokenIn)
  // Saleing token / token out
  let tokenOut = getOrCreateSaleToken(saleInfo.tokenOut)
  // Update assign tokenIn and TokenOut foreign keys
  fixedPriceSale.tokenIn = tokenIn.id
  fixedPriceSale.tokenOut = tokenOut.id
  // Sale name
  fixedPriceSale.name = tokenOut.name || ''
  log.debug('TEMPLATE ADDR = {}', [event.params.template.toHexString()])
  // fixedPriceSale.launchedTemplate = event.params.template.toHexString()
  // Save
  fixedPriceSale.save()

  return fixedPriceSale
}
