import { log } from '@graphprotocol/graph-ts'

// Contract ABIs and Events
import { FactoryInitialized, TemplateLaunched } from '../../generated/MesaFactory/MesaFactory'
import { EasyAuction as EasyAuctionContract } from '../../generated/EasyAuction/EasyAuction'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'

// Mapping helpers
import {
  AUCTION_STATUS,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  getOrCreateAuctionToken,
  MESA_FACTORY
} from './helpers'

/**
 * Handle initilizing the MesaFactory.
 * Presumely, this handler is called once
 * @param event
 * @returns
 */
export function handleFactoryInitialized(event: FactoryInitialized): void {
  let mesaFactory = new Schemas.MesaFactory(MESA_FACTORY.ID)

  // Address of factory
  mesaFactory.address = event.address.toHexString()

  // Fees collector from auctions
  mesaFactory.feeTo = event.params.feeTo.toHexString()
  // Fee Manager
  mesaFactory.feeManager = event.params.feeManager.toHexString()
  mesaFactory.feeNumerator = event.params.feeNumerator.toI32()

  // Address of TemplateLauncher contract
  mesaFactory.templateLauncher = event.params.templateLauncher.toHexString()
  // Address of TemplateManager contract
  mesaFactory.templateManager = event.params.templateManager.toHexString()
  // Save
  mesaFactory.save()
}

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
  const auctionTemplate = Schemas.AuctionTemplate.load(event.params.templateId.toHex())

  // Early exit
  if (!auctionTemplate) {
    return
  }

  // EasyAuction
  if (auctionTemplate.name === 'EasyAuction') {
    createEasyAuction(event)
  }

  // FixedPriceAuction
  if (auctionTemplate.name === 'FixedPriceAuction') {
    createFixedPriceAuction(event)
  }

  // Add more templates to registery and
}

/**
 * Creates a new EasyAuction entity
 * @param event `TemplateLaunched` event
 */
function createEasyAuction(event: TemplateLaunched): void {
  // Bind the new Contract
  let easyAuctionContract = EasyAuctionContract.bind(event.params.auction)

  // Assume that the first template registered is EasyAuction
  let easyAuction = new Schemas.EasyAuction(event.params.auction.toHexString())
  // Timestamps
  easyAuction.createdAt = event.block.timestamp.toI32()
  easyAuction.updatedAt = event.block.timestamp.toI32()

  easyAuction.minimumBidAmount = easyAuctionContract.minimumBiddingAmountPerOrder().toI32()
  // Save initial data
  easyAuction.save()
  // Entity
  let auction = new Schemas.EasyAuction(event.address.toHexString())

  // Start and end dates of the auction
  auction.startDate = easyAuctionContract.auctionStartedDate().toI32()
  auction.endDate = easyAuctionContract.auctionEndDate().toI32()
  // Grace period start and end
  auction.gracePeriodStartDate = easyAuctionContract.gracePeriodEndDate().toI32()
  auction.gracePeriodEndDate = easyAuctionContract.gracePeriodEndDate().toI32()

  // Auction status
  auction.status = AUCTION_STATUS.UPCOMING

  // Total amount of token to be auctioned
  // auction.tokenAmount = ?

  // Bidding token / token in
  let tokenIn = getOrCreateAuctionToken(easyAuctionContract.biddingToken())
  tokenIn.name = fetchTokenName(easyAuctionContract.biddingToken())
  tokenIn.symbol = fetchTokenSymbol(easyAuctionContract.biddingToken())
  tokenIn.decimals = fetchTokenDecimals(easyAuctionContract.biddingToken()).toI32()

  // Auctioning token / token out
  let tokenOut = getOrCreateAuctionToken(easyAuctionContract.auctioningToken())
  tokenOut.name = fetchTokenName(easyAuctionContract.auctioningToken())
  tokenOut.symbol = fetchTokenSymbol(easyAuctionContract.auctioningToken())
  tokenOut.decimals = fetchTokenDecimals(easyAuctionContract.auctioningToken()).toI32()

  // Update assign tokenIn and TokenOut foregin keys
  auction.tokenIn = tokenIn.id
  auction.tokenOut = tokenOut.id

  /**
   * @todo find a resolver for the name
   * Use the token's name for name of the Auction
   */
  auction.name = tokenOut.name

  // Save everything
  tokenIn.save()
  tokenOut.save()
  auction.save()
}

/**
 * Creates a new FixedPriceAuction entity
 * @param event `TemplateLaunched` event
 */
function createFixedPriceAuction(event: TemplateLaunched): void {
  // WIP
}
