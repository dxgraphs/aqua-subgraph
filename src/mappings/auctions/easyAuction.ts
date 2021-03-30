import { Address } from '@graphprotocol/graph-ts'
import {
  EasyAuction as EasyAuctionContract,
  InitializedAuction,
  CancellationOrder,
  UserRegistration,
  ClaimedFromOrder,
  AuctionCleared,
  NewOrder,
  NewUser,
  NewOrder__Params
} from '../../../generated/EasyAuction/EasyAuction'

// GraphQL Schemas
import * as Schemas from '../../../generated/schema'

// Helpers
import { AUCTION_STATUS, BID_STATUS } from '../../helpers/auctions'

/**
 * Handles when the any EasyAuction emits
 * @param event E
 */
export function handleInitializedAuction(event: InitializedAuction): void {
  // Find the from
  let easyAuction = Schemas.EasyAuction.load(event.address.toHexString())
  // The contract either doesn't exists or belong to Mesa
  if (!easyAuction) {
    return
  }

  // Get the contract
  let easyAuctionContract = EasyAuctionContract.bind(event.address)

  // Update timestamp
  easyAuction.updatedAt = event.block.timestamp.toI32()

  easyAuction.save()
}

/**
 * Handles any Auction that has cleared
 * @param event
 */
export function handleAuctionCleared(event: AuctionCleared): void {
  if (!isAuctionBelongsToMesa(event.address)) {
    return
  }

  let auction = Schemas.EasyAuction.load(event.address.toHexString()) // event.address is the contract that emits the event

  if (!auction) {
    return
  }

  auction.updatedAt = event.block.timestamp.toI32()
  auction.status = AUCTION_STATUS.SETTLED
  auction.save()
}

export function handleCancellationOrder(event: CancellationOrder): void {
  if (!isAuctionBelongsToMesa(event.address)) {
    return
  }

  // ToDo: concatenate unique id
  let bid = Schemas.EasyAuctionBid.load(event.transaction.hash.toHexString())

  if (!bid) {
    return
  }

  bid.updatedAt = event.block.timestamp.toI32()
  bid.deletedAt = event.block.timestamp.toI32()
  bid.status = BID_STATUS.CANCELLED
  bid.save()
}

export function handleClaimedFromOrder(event: ClaimedFromOrder): void {
  if (!isAuctionBelongsToMesa(event.address)) {
    return
  }

  // ToDo: concatenate unique id
  let bid = Schemas.EasyAuctionBid.load(event.transaction.hash.toHexString())

  if (!bid) {
    return
  }

  bid.updatedAt = event.block.timestamp.toI32()
  bid.status = BID_STATUS.CLAIMED
  bid.save()
}

/**
 * Handles new Order (Bid) placement on the Auction
 * @param event
 */
export function handleNewOrder(event: NewOrder): void {
  if (!isAuctionBelongsToMesa(event.address)) {
    return
  }

  let orderId = encodeOrder(event.params)

  // ToDo: concatenate unique id
  let bid = new Schemas.EasyAuctionBid(orderId)
  // bid.auction = event.address.toHexString()
  bid.createdAt = event.block.timestamp.toI32()
  bid.updatedAt = event.block.timestamp.toI32()
  bid.tokenInAmount = event.params.amountToBid.toI32()
  bid.tokenOutAmount = event.params.amountToBuy.toI32()
  bid.address = event.transaction.from.toHexString()
  bid.status = BID_STATUS.SUBMITTED
  bid.save()
}

/**
 * Handles NewUser
 * @param event
 */
export function handleNewUser(event: NewUser): void {
  if (!isAuctionBelongsToMesa(event.address)) {
    return
  }

  let auctionUser = new Schemas.AuctionUser(event.params.userId.toHexString())
  auctionUser.address = event.params.userAddress.toHexString()
  auctionUser.save()
}

export function handleUserRegistration(event: UserRegistration): void {
  if (!isAuctionBelongsToMesa(event.address)) {
    return
  }
}

export function encodeOrder(order: NewOrder__Params): string {
  return (
    '0x' +
    order.userId
      .toHexString()
      .slice(2)
      .padStart(16, '0') +
    order.amountToBuy
      .toHexString()
      .slice(2)
      .padStart(24, '0') +
    order.amountToBid
      .toHexString()
      .slice(2)
      .padStart(24, '0')
  )
}

/**
 * Checks if the contract that emitted the event belongs to Mesa
 * @param auctionAddress
 */
export function isAuctionBelongsToMesa(auctionContractAddress: Address): boolean {
  // Find the from
  let easyAuction = Schemas.EasyAuction.load(auctionContractAddress.toHexString())

  if (easyAuction != null) {
    return true
  }

  return false
}
