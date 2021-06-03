// Externals
import { Address, BigInt } from '@graphprotocol/graph-ts'

// Contract ABIs and Events
import {
  FairSale as FairSaleContract,
  CancellationOrder,
  UserRegistration,
  ClaimedFromOrder,
  SaleCleared,
  NewOrder,
  NewUser
} from '../../../generated/FairSale/FairSale'

// GraphQL Schemas
import * as Schemas from '../../../generated/schema'

// Helpers
import { SALE_STATUS, BID_STATUS } from '../../helpers/sales'
import { encodeOrder } from '../../helpers/fairSale'

/**
 * Handles any Auction that has cleared
 * @param event
 */
export function handleSaleCleared(event: SaleCleared): void {
  if (!isFairSaleBelongsToMesa(event.address)) {
    return
  }

  let sale = Schemas.FairSaleBid.load(event.address.toHexString()) // event.address is the contract that emits the event

  if (!sale) {
    return
  }

  sale.updatedAt = event.block.timestamp.toI32()
  sale.status = SALE_STATUS.SETTLED
  sale.save()
}

export function handleCancellationOrder(event: CancellationOrder): void {
  if (!isFairSaleBelongsToMesa(event.address)) {
    return
  }

  // ToDo: concatenate unique id
  let bid = Schemas.FairSaleBid.load(event.transaction.hash.toHexString())

  if (!bid) {
    return
  }

  bid.updatedAt = event.block.timestamp.toI32()
  bid.deletedAt = event.block.timestamp.toI32()
  bid.status = BID_STATUS.CANCELLED
  bid.save()
}

export function handleClaimedFromOrder(event: ClaimedFromOrder): void {
  if (!isFairSaleBelongsToMesa(event.address)) {
    return
  }

  // ToDo: concatenate unique id
  let bid = Schemas.FairSaleBid.load(event.transaction.hash.toHexString())
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
  if (!isFairSaleBelongsToMesa(event.address)) {
    return
  }
  // Construct entity ID from the parameters
  let orderId = encodeOrder(event.params.ownerId, event.params.orderTokenOut, event.params.orderTokenIn)
  let bid = new Schemas.FairSaleBid(orderId)
  bid.sale = event.address.toHexString()
  bid.createdAt = event.block.timestamp.toI32()
  bid.updatedAt = event.block.timestamp.toI32()
  bid.tokenInAmount = event.params.orderTokenIn
  bid.tokenOutAmount = event.params.orderTokenOut
  // Update FairSaleUser ref
  bid.ownerId = event.transaction.from.toString()
  // Update FairSale ref
  bid.sale = event.address.toString()
  bid.status = BID_STATUS.SUBMITTED
  // Save
  bid.save()
}

/**
 * Handles NewUser
 * @param event
 */
export function handleNewUser(event: NewUser): void {
  if (!isFairSaleBelongsToMesa(event.address)) {
    return
  }

  // Use their address as unique id
  let saleUser = new Schemas.FairSaleUser(event.params.ownerId.toHexString())
  // Update ref to FairSale
  saleUser.sale = event.address.toString()
  saleUser.ownerId = event.params.ownerId.toI32()
  saleUser.createdAt = event.block.timestamp.toI32()
  saleUser.updatedAt = event.block.timestamp.toI32()
  saleUser.address = event.params.userAddress
  saleUser.save()
}

/**
 * Does the same as `NewUser` handler. See `handleNewUser`
 */
export function handleUserRegistration(event: UserRegistration): void {}

/**
 * Checks if the contract that emitted the event belongs to Mesa
 * @param auctionAddress
 */
function isFairSaleBelongsToMesa(fairSaleContractAddress: Address): boolean {
  // Find the from
  let fairSale = Schemas.FairSale.load(fairSaleContractAddress.toHexString())

  if (fairSale != null) {
    return true
  }

  return false
}
