// Externals
import { log } from '@graphprotocol/graph-ts'

// Contract ABIs and Events
import {
  TemplateAdded,
  TemplateRemoved,
  TemplateVerified,
  TemplateLaunched
} from '../../generated/TemplateLauncher/TemplateLauncher'

// Helpers
import { AUCTION_TEMPLATES, fetchTemplateName, getAuctionTemplateById } from '../helpers/templates'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'

/**
 * Handles launching a new Auction - EasyAuction or FixedPriceAuction from AuctionLauncher via MesaFactory.
 *
 * See [`MesaFactory.LuanchTemplate`](https://github.com/cryptonative-ch/mesa-smartcontracts/blob/main/contracts/MesaFactory.sol)
 *
 * @todo Load the AuctionName from the contract to determine type of Auction
 *
 */
export function handleTemplateLaunched(event: TemplateLaunched): void {
  log.info('New template launched addres: {} {}', [event.params.auction.toString(), event.params.templateId.toString()])

  // Determine the entity to use from the templateId
  let auctionTemplate = getAuctionTemplateById(event.params.templateId.toHexString())

  // Template does not exist in database
  if (!auctionTemplate) {
    return
  }

  if (auctionTemplate.name === AUCTION_TEMPLATES.EASY_AUCTION) {
    let easyAuction = new Schemas.EasyAuction(event.params.auction.toHexString())
    easyAuction.createdAt = event.block.timestamp.toI32()
    easyAuction.updatedAt = event.block.timestamp.toI32()
    easyAuction.save()
  }

  if (auctionTemplate.name === AUCTION_TEMPLATES.FIXED_PRICE_AUCTION) {
    let fixedPriceAuction = new Schemas.FixedPriceAuction(event.params.auction.toHexString())
    fixedPriceAuction.createdAt = event.block.timestamp.toI32()
    fixedPriceAuction.updatedAt = event.block.timestamp.toI32()
    fixedPriceAuction.save()
  }
}

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateAdded(event: TemplateAdded): void {
  let auctionTemplate = new Schemas.AuctionTemplate(event.params.templateId.toHexString())
  // Factory address
  auctionTemplate.factory = event.address.toHexString()
  // Auction address
  auctionTemplate.address = event.params.template.toHexString()
  // Auction name: used to resolve ID to contract ABIs
  auctionTemplate.name = fetchTemplateName(event.address)
  // By default, templates are unverified
  auctionTemplate.verified = false
  // Save entity
  auctionTemplate.save()
}

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateVerified(event: TemplateVerified): void {
  let auctionTemplate = Schemas.AuctionTemplate.load(event.params.templateId.toHexString())
  if (auctionTemplate) {
    auctionTemplate.verified = true
    // Save entity
    auctionTemplate.save()
  }
}

/**
 * Handles removing templates from the contract
 * @param event
 */
export function handleTemplateRemoved(event: TemplateRemoved): void {}
