// Exterals
import { Address } from '@graphprotocol/graph-ts'

// GraphQL schema
import { Token } from '../../generated/schema'

// ERC20 helpers
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from './erc20'

// Predefined Auction status
export abstract class SALE_STATUS {
  static UPCOMING: string = 'UPCOMING'
  static SETTLED: string = 'SETTLED'
  static FAILED: string = 'FAILED'
  static CLOSED: string = 'CLOSED'
  static OPEN: string = 'OPEN'
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
export function getOrCreateSaleToken(tokenAddress: Address): Token {
  // Try to fetch existing token
  let token = Token.load(tokenAddress.toHexString())
  // Token does not exist, create new record
  if (token == null) {
    token = new Token(tokenAddress.toHexString())
    // Fetch inoformation about the token
    token.decimals = fetchTokenDecimals(tokenAddress)
    token.symbol = fetchTokenSymbol(tokenAddress)
    token.name = fetchTokenName(tokenAddress)
    token.save()
  }
  return token as Token
}
