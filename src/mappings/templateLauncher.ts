// Contract ABIs and Events
import {
  TemplateAdded,
  TemplateRemoved,
  TemplateVerified,
  TemplateLaunched
} from '../../generated/TemplateLauncher/TemplateLauncher'

// Helpers
import { SALE_TEMPLATES, fetchTemplateName, getSaleTemplateById } from '../helpers/templates'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'
import { logToMesa } from '../helpers'

/**
 * Handles launching a new Auction - EasyAuction or FixedPriceAuction from AuctionLauncher via MesaFactory.
 *
 * See [`MesaFactory.LuanchTemplate`](https://github.com/cryptonative-ch/mesa-smartcontracts/blob/main/contracts/MesaFactory.sol)
 *
 * @todo Load the AuctionName from the contract to determine type of Auction
 *
 */
export function handleTemplateLaunched(event: TemplateLaunched): void {
  // Determine the entity to use from the templateId
  let saleTemplate = getSaleTemplateById(event.params.templateId.toString())
  logToMesa('saleTemplate (' + saleTemplate.name + ') found using templateId: ' + event.params.templateId.toString())
  // Template does not exist in database
  if (!saleTemplate) {
    return
  }

  if (saleTemplate.name === SALE_TEMPLATES.FAIR_SALE) {
    logToMesa(`Creating new FairSale`)
    let fairSale = new Schemas.FairSale(event.params.sale.toHexString())
    fairSale.createdAt = event.block.timestamp.toI32()
    fairSale.updatedAt = event.block.timestamp.toI32()
    fairSale.save()
  }

  if (saleTemplate.name === SALE_TEMPLATES.FIXED_PRICE_SALE) {
    let fixedPriceSale = new Schemas.FixedPriceSale(event.params.sale.toHexString())
    logToMesa(`Creating new FixedPriceSale`)
    fixedPriceSale.createdAt = event.block.timestamp.toI32()
    fixedPriceSale.updatedAt = event.block.timestamp.toI32()
    fixedPriceSale.save()
  }
}

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateAdded(event: TemplateAdded): void {
  let saleTemplate = new Schemas.SaleTemplate(event.params.templateId.toString())
  // Meta
  saleTemplate.createdAt = event.block.timestamp.toI32()
  saleTemplate.updatedAt = event.block.timestamp.toI32()
  // Factory address
  saleTemplate.factory = event.address.toHexString()
  // Template contract address
  saleTemplate.address = event.params.template.toHexString()
  // Auction name: used to resolve ID to contract ABIs
  saleTemplate.name = fetchTemplateName(event.params.template)
  // By default, templates are unverified
  saleTemplate.verified = false
  // Save entity
  saleTemplate.save()
}

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateVerified(event: TemplateVerified): void {
  let saleTemplate = Schemas.SaleTemplate.load(event.params.templateId.toHexString())
  if (saleTemplate) {
    saleTemplate.verified = true
    saleTemplate.updatedAt = event.block.timestamp.toI32()
    // Save entity
    saleTemplate.save()
  }
}

/**
 * Handles removing templates from the contract
 * @param event
 */
export function handleTemplateRemoved(event: TemplateRemoved): void {
  let saleTemplate = Schemas.SaleTemplate.load(event.params.templateId.toHexString())
  if (saleTemplate) {
    saleTemplate.updatedAt = event.block.timestamp.toI32()
    saleTemplate.deletedAt = event.block.timestamp.toI32()
    // Save entity
    saleTemplate.save()
  }
}
