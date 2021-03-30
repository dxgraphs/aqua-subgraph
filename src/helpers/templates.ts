// Externals
import { Address, log } from '@graphprotocol/graph-ts'

// Contract ABIs and types
import { AuctionTemplateNameBytes } from '../../generated/TemplateLauncher/AuctionTemplateNameBytes'

// GraphQL schema
import { AuctionTemplate } from '../../generated/schema'

// Available Auction types/templates/mechanisms
export abstract class AUCTION_TEMPLATES {
  static EASY_AUCTION: string = 'EasyAuction'
  static FIXED_PRICE_AUCTION: string = 'FixedPriceAuction'
}

/**
 * Returns the template name from the `<TemplateName>Template` contract.
 * @param address the address of the contract
 */
export function fetchTemplateName(address: Address): string {
  let auctionTemplateNameBytesContract = AuctionTemplateNameBytes.bind(address)
  // Debug
  log.info('Contract Address: {}', [auctionTemplateNameBytesContract._address.toHexString()])
  // templateName() and return
  return auctionTemplateNameBytesContract.try_templateName().value
}

/**
 *
 * @param auctionAddress
 * @returns
 */
export function getAuctionTemplateById(templateId: string): AuctionTemplate {
  return AuctionTemplate.load(templateId) as AuctionTemplate
}
