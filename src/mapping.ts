import { BigInt } from '@graphprotocol/graph-ts'
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
import { AUCTION_ADDRESS, fetchTokenName, fetchTokenSymbol, fetchTokenDecimals } from './helpers'

export function handleNewAuction(event: NewAuction): void {
  let auction = Auction.load(AUCTION_ADDRESS)

  auction.id = event.params.auctionId.toHexString()
  auction.createdAt = event.block.timestamp.toI32()
  auction.updatedAt = event.block.timestamp.toI32()
  auction.status = 'open'
  auction.startTime = event.block.timestamp.toI32() // ToDo: Add  to contract event
  auction.endTime = event.params.auctionEndDate.toI32()
  auction.gracePeriod = 0 //ToDo: Add to contract event
  auction.tokenAmount = event.params._auctionedSellAmount.toI32()

  let tokenIn = AuctionToken.load(event.params._biddingToken.toHexString())
  tokenIn.name = fetchTokenName(event.params._biddingToken)
  tokenIn.address = event.params._biddingToken.toString()
  tokenIn.symbol = fetchTokenSymbol(event.params._biddingToken)
  tokenIn.decimals = fetchTokenDecimals(event.params._biddingToken).toI32()
  // ToDo: tokenIn.icon = ''

  let tokenOut = AuctionToken.load(event.params._auctioningToken.toHexString())

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

export function handleAuctionCleared(event: AuctionCleared): void {}

export function handleCancellationSellOrder(event: CancellationSellOrder): void {}

export function handleClaimedFromOrder(event: ClaimedFromOrder): void {}

export function handleNewSellOrder(event: NewSellOrder): void {}

export function handleNewUser(event: NewUser): void {}

export function handleUserRegistration(event: UserRegistration): void {}
