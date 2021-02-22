import {
  EasyAuction,
  AuctionCleared,
  CancellationSellOrder,
  ClaimedFromOrder,
  NewAuction,
  NewSellOrder,
  NewUser,
  UserRegistration
} from '../generated/EasyAuction/EasyAuction'
import { Auction, AuctionBid, AuctionToken } from '../generated/schema'
import {
  AUCTION_ADDRESS,
  AUCTION_STATUS,
  BID_STATUS,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenDecimals
} from './helpers'

/**
 * @todo replace `AUCTION_ADDRESS` with `event.params.auctionId` when `EasyAuction` implement Factory pattern
 * @todo Fetch token icon for `tokenIn` and `tokenOut`
 */
export function handleNewAuction(event: NewAuction): void {
  let auction = new Auction(AUCTION_ADDRESS)
  auction.createdAt = event.block.timestamp.toI32()
  auction.updatedAt = event.block.timestamp.toI32()
  auction.status = AUCTION_STATUS.UPCOMING
  auction.startTime = event.block.timestamp.toI32() // ToDo: Add  to contract event
  auction.endTime = event.params.auctionEndDate.toI32()
  auction.gracePeriod = 0 //ToDo: Add to contract event
  auction.tokenAmount = event.params._auctionedSellAmount.toI32()

  let tokenIn = new AuctionToken(event.params._biddingToken.toHexString())
  tokenIn.name = fetchTokenName(event.params._biddingToken)
  tokenIn.address = event.params._biddingToken.toString()
  tokenIn.symbol = fetchTokenSymbol(event.params._biddingToken)
  tokenIn.decimals = fetchTokenDecimals(event.params._biddingToken).toI32()
  // ToDo: tokenIn.icon = ''

  let tokenOut = new AuctionToken(event.params._auctioningToken.toHexString())

  tokenIn.name = fetchTokenName(event.params._auctioningToken)
  tokenIn.address = event.params._auctioningToken.toString()
  tokenIn.symbol = fetchTokenSymbol(event.params._auctioningToken)
  tokenIn.decimals = fetchTokenDecimals(event.params._auctioningToken).toI32()
  // ToDo: tokenIn.icon = ''

  auction.tokenIn = tokenIn.id
  auction.tokenOut = tokenOut.id

  tokenIn.save()
  tokenOut.save()
  auction.save()
}

export function handleAuctionCleared(event: AuctionCleared): void {
  let auction = Auction.load(event.params.auctionId.toHexString())
  auction.updatedAt = event.block.timestamp.toI32()
  auction.status = AUCTION_STATUS.OPEN
}

export function handleCancellationSellOrder(event: CancellationSellOrder): void {
  // ToDo: concatenate unique id
  let bid = AuctionBid.load(event.transaction.hash.toHexString())
  bid.updatedAt = event.block.timestamp.toI32()
  bid.deletedAt = event.block.timestamp.toI32()
  bid.status = BID_STATUS.CANCELLED
  bid.save()
}

export function handleClaimedFromOrder(event: ClaimedFromOrder): void {
  // ToDo: concatenate unique id
  let bid = AuctionBid.load(event.transaction.hash.toHexString())
  bid.updatedAt = event.block.timestamp.toI32()
  bid.status = BID_STATUS.CLAIMED
  bid.save()
}

export function handleNewSellOrder(event: NewSellOrder): void {
  // ToDo: concatenate unique id
  let bid = AuctionBid.load(event.transaction.hash.toHexString())
  bid.auction = event.address.toHexString()
  bid.createdAt = event.block.timestamp.toI32()
  bid.updatedAt = event.block.timestamp.toI32()
  bid.tokenInAmount = event.params.buyAmount.toI32()
  bid.tokenOutAmount = event.params.sellAmount.toI32()
  bid.address = event.transaction.from.toHexString()
  bid.status = BID_STATUS.SUBMITTED
  bid.save()
}
