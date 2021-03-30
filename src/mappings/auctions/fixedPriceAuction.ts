// Contract ABIs and Events
import {
  FixedPriceAuction as FixedPriceAuctionContract,
  AuctionInitalized,
  NewTokenRelease,
  AuctionClosed,
  NewTokenClaim,
  NewPurchase
} from '../../../generated/FixedPriceAuction/FixedPriceAuction'

// GraphQL Schemas
import { FixedPriceAuction } from '../../../generated/schema'

// Helpers
import { AUCTION_STATUS } from '../../helpers/auctions'

export function handleAuctionInitalized(event: AuctionInitalized): void {
  let fixedPriceAuction = new FixedPriceAuction(event.address.toHexString())
  // Timestamp
  fixedPriceAuction.updatedAt = event.block.timestamp.toI32()
  fixedPriceAuction.startDate = event.params.startDate.toI32()
  fixedPriceAuction.endDate = event.params.endDate.toI32()
  // Save entity
  fixedPriceAuction.save()
}

export function handleAuctionClosed(event: AuctionClosed): void {
  let fixedPriceAuction = FixedPriceAuction.load(event.address.toHexString())

  if (!fixedPriceAuction) {
    return
  }

  fixedPriceAuction.status = AUCTION_STATUS.ENDED
  fixedPriceAuction.save()
}

/**
 * WIP
 */
export function handleNewPurchase(event: NewPurchase): void {}

/**
 * WIP
 */
export function handleNewTokenClaim(event: NewTokenClaim): void {}

/**
 * WIP
 */
export function handleNewTokenRelease(event: NewTokenRelease): void {}
