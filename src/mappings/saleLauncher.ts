// Externals
import { BigInt } from '@graphprotocol/graph-ts'
// Contract Types and ABIs
import { FixedPriceSale as FixedPriceSaleContract } from '../../generated/templates/FixedPriceSale/FixedPriceSale'
import { SaleInitialized } from '../../generated/SaleLauncher/SaleLauncher'
import { FixedPriceSale } from '../../generated/templates'

// Helpers
import { getSaleTemplateById, SALE_TEMPLATES } from '../helpers/templates'
import { SALE_STATUS, getOrCreateSaleToken } from '../helpers/sales'
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
 * Creates a new FixedPriceSale entity
 */
function registerFixedPriceSale(event: SaleInitialized): Schemas.FixedPriceSale {
  // Bind the new Contract
  let fixedPriceSaleContract = FixedPriceSaleContract.bind(event.params.sale)
  // Create new EasySale entity
  let fixedPriceSale = new Schemas.FixedPriceSale(event.params.sale.toHexString())
  // Fetch sale info and deconstruct it
  let saleInfo = FixedPriceSaleSaleInfo.fromResult(fixedPriceSaleContract.saleInfo())
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
  // Template that launched sale
  fixedPriceSale.launchedTemplate = event.params.template.toHexString()
  // Update launchedSaleTemplate.saleCreated
  {
    let launchedSaleTemplate = Schemas.LaunchedSaleTemplate.load(event.params.template.toHexString())
    if (launchedSaleTemplate) {
      launchedSaleTemplate.saleCreated = true
      launchedSaleTemplate.save()
    }
  }
  // Save
  fixedPriceSale.save()

  return fixedPriceSale
}
