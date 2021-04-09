// Contract Types and ABIs
import { FixedPriceSale as FixedPriceSaleContract } from '../../generated/FixedPriceSale/FixedPriceSale'
import { FairSale as FairSaleContract } from '../../generated/FairSale/FairSale'
import { SaleInitialized } from '../../generated/SaleLauncher/SaleLauncher'

// Helpers
import { getSaleTemplateById, SALE_TEMPLATES } from '../helpers/templates'
import { SALE_STATUS, getOrCreateSaleToken } from '../helpers/sales'

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

  if (saleTemplate.name === SALE_TEMPLATES.FAIR_SALE) {
    handleFairSaleInitialized(event)
  }

  if (saleTemplate.name === SALE_TEMPLATES.FIXED_PRICE_SALE) {
    handleFixedPriceSaleInitialized(event)
  }
}

/**
 * Creates a new FairSale entity from
 */
function handleFairSaleInitialized(event: SaleInitialized): void {
  // Bind the new Contract
  let fairSaleContract = FairSaleContract.bind(event.params.sale)
  // Create new EasySale entity
  let fairSale = new Schemas.FairSale(event.params.sale.toHexString())
  // Timestamps
  fairSale.createdAt = event.block.timestamp.toI32()
  fairSale.updatedAt = event.block.timestamp.toI32()
  fairSale.minimumBidAmount = fairSaleContract.minimumBiddingAmountPerOrder().toI32()
  // Start and end dates of the sale
  fairSale.startDate = fairSaleContract.auctionStartedDate().toI32()
  fairSale.endDate = fairSaleContract.endDate().toI32()
  // Sale status
  fairSale.status = SALE_STATUS.UPCOMING
  fairSale.tokenAmount = 0
  // Bidding token / token in
  let tokenIn = getOrCreateSaleToken(fairSaleContract.tokenIn())
  // Saleing token / token out
  let tokenOut = getOrCreateSaleToken(fairSaleContract.tokenOut())
  // Update assign tokenIn and TokenOut foregin keys
  fairSale.tokenIn = tokenIn.id
  fairSale.tokenOut = tokenOut.id
  // Sale name
  fairSale.name = tokenOut.name || ''
  // Save
  fairSale.save()
}

/**
 * Creates a new FixedPriceSale entity
 */
function handleFixedPriceSaleInitialized(event: SaleInitialized): void {
  // Bind the new Contract
  let fixedPriceSaleContract = FixedPriceSaleContract.bind(event.params.sale)
  // Create new EasySale entity
  let fixedPriceSale = new Schemas.FixedPriceSale(event.params.sale.toHexString())
  // Timestamps
  fixedPriceSale.createdAt = event.block.timestamp.toI32()
  fixedPriceSale.updatedAt = event.block.timestamp.toI32()
  // Minimum raise amount
  fixedPriceSale.minimumRaise = fixedPriceSaleContract.minimumRaise().toI32()
  // Start and end dates of the sale
  fixedPriceSale.startDate = fixedPriceSaleContract.startDate().toI32()
  fixedPriceSale.endDate = fixedPriceSaleContract.endDate().toI32()
  // Sale status
  fixedPriceSale.status = SALE_STATUS.UPCOMING
  // Bidding token / token in
  let tokenIn = getOrCreateSaleToken(fixedPriceSaleContract.tokenIn())
  // Saleing token / token out
  let tokenOut = getOrCreateSaleToken(fixedPriceSaleContract.tokenOut())
  // Update assign tokenIn and TokenOut foreign keys
  fixedPriceSale.tokenIn = tokenIn.id
  fixedPriceSale.tokenOut = tokenOut.id
  // Sale name
  fixedPriceSale.name = tokenOut.name || ''
  // Save
  fixedPriceSale.save()
}