import { Address } from '@graphprotocol/graph-ts'

// GraphQL schema
import { AuctionToken } from '../../generated/schema'

// Predefined Auction status
export abstract class AUCTION_STATUS {
  static UPCOMING: string = 'upcoming'
  static SETTLED: string = 'settled'
  static ENDED: string = 'ended'
  static OPEN: string = 'open'
}

// Predefined Auction Bid status
export abstract class BID_STATUS {
  static SUBMITTED: string = 'submitted'
  static CANCELLED: string = 'cancelled'
  static SETTLED: string = 'settled'
  static CLAIMED: string = 'claimed'
}

/**
 * Returns an existing AuctionToken instance if exists.
 * Creates a new instance if it does not.
 * @param tokenAddress the ERC20 contract address
 */
export function getOrCreateAuctionToken(tokenAddress: Address): AuctionToken {
  // Try to fetch existing token
  let auctionToken = AuctionToken.load(tokenAddress.toHexString())
  // Token does not exist, create new record
  if (auctionToken == null) {
    auctionToken = new AuctionToken(tokenAddress.toHexString())
    // Set the address
    auctionToken.address = tokenAddress.toHexString()
  }
  return auctionToken as AuctionToken
}
