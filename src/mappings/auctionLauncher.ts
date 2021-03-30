// Contract Types and ABIs
import { AuctionLaunched, AuctionInitialized } from '../../generated/AuctionLauncher/AuctionLauncher'
import { EasyAuction as EasyAuctionContract } from '../../generated/EasyAuction/EasyAuction'

// Helpers
import { fetchTokenDecimals, fetchTokenSymbol, fetchTokenName } from '../helpers/erc20'
import { getAuctionTemplateById, AUCTION_TEMPLATES } from '../helpers/templates'
import { AUCTION_STATUS, getOrCreateAuctionToken } from '../helpers/auctions'

// GraphQL schemas
import * as Schemas from '../../generated/schema'

export function handleAuctionInitialized(event: AuctionInitialized): void {
  let acutionTemplate = getAuctionTemplateById(event.params.templateId.toHexString())

  // Template does not exist, exit
  if (!acutionTemplate) {
    return
  }

  if (acutionTemplate.name === AUCTION_TEMPLATES.EASY_AUCTION) {
    handleEasyAuctionInitialized(event)
  }

  if (acutionTemplate.name === AUCTION_TEMPLATES.FIXED_PRICE_AUCTION) {
    handleFixedPriceAuctionInitialized(event)
  }
}

/**
 * Handle Launching an (Easy|FixedPrice)Auction via AuctionLauncher.
 * This only creates reference in the subgraph for the Auction
 * @param event
 */
export function handleAuctionLaunched(event: AuctionLaunched): void {}

/**
 * Creates a new EasyAuction entity
 * @param event `TemplateLaunched` event
 */
export function handleEasyAuctionInitialized(event: AuctionInitialized): void {
  // Bind the new Contract
  let easyAuctionContract = EasyAuctionContract.bind(event.params.auction)
  // Create new EasyAuction entity
  let easyAuction = new Schemas.EasyAuction(event.params.auction.toHexString())
  // Timestamps
  easyAuction.createdAt = event.block.timestamp.toI32()
  easyAuction.updatedAt = event.block.timestamp.toI32()

  easyAuction.minimumBidAmount = easyAuctionContract.minimumBiddingAmountPerOrder().toI32()

  // Start and end dates of the auction
  easyAuction.startDate = easyAuctionContract.auctionStartedDate().toI32()
  easyAuction.endDate = easyAuctionContract.auctionEndDate().toI32()
  // Grace period start and end
  easyAuction.gracePeriodStartDate = easyAuctionContract.gracePeriodEndDate().toI32()
  easyAuction.gracePeriodEndDate = easyAuctionContract.gracePeriodEndDate().toI32()

  // Auction status
  easyAuction.status = AUCTION_STATUS.UPCOMING

  // Total amount of token to be auctioned
  // auction.tokenAmount = ?

  // Bidding token / token in
  let tokenIn = getOrCreateAuctionToken(easyAuctionContract.biddingToken())
  tokenIn.decimals = fetchTokenDecimals(easyAuctionContract.biddingToken()).toI32()
  tokenIn.symbol = fetchTokenSymbol(easyAuctionContract.biddingToken())
  tokenIn.name = fetchTokenName(easyAuctionContract.biddingToken())

  // Auctioning token / token out
  let tokenOut = getOrCreateAuctionToken(easyAuctionContract.auctioningToken())
  tokenOut.decimals = fetchTokenDecimals(easyAuctionContract.auctioningToken()).toI32()
  tokenOut.symbol = fetchTokenSymbol(easyAuctionContract.auctioningToken())
  tokenOut.name = fetchTokenName(easyAuctionContract.auctioningToken())

  // Update assign tokenIn and TokenOut foregin keys
  easyAuction.tokenIn = tokenIn.id
  easyAuction.tokenOut = tokenOut.id

  /**
   * @todo find a resolver for the name
   * Use the token's name for name of the Auction
   */
  easyAuction.name = tokenOut.name

  // Save everything
  tokenIn.save()
  tokenOut.save()
  easyAuction.save()
}

/**
 * Creates a new FixedPriceAuction entity
 * @param event `TemplateLaunched` event
 */
function handleFixedPriceAuctionInitialized(event: AuctionInitialized): void {
  // WIP
}
