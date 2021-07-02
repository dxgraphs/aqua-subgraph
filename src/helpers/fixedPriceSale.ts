import { Address, BigInt } from '@graphprotocol/graph-ts'
// Schema
import { FixedPriceSaleUser } from '../../generated/schema'

// Predefined Auction Bid status
export abstract class PURCHASE_STATUS {
  static SUBMITTED: string = 'SUBMITTED'
  static CLAIMED: string = 'CLAIMED'
}

/**
 * Helper function to construct the `FixedPriceSaleUser` entity IDs
 */
export function createFixedPriceSaleUserId(saleAddress: Address, userAddres: Address): string {
  let fixedPriceSaleUserId = saleAddress.toHexString() + '/users/' + userAddres.toHexString()
  return fixedPriceSaleUserId
}

/**
 * Helper function to construct the `FixedPriceSalePurchase` entity IDs
 */
export function createFixedPriceSalePurchaseId(
  saleAddress: Address,
  userAddres: Address,
  purchaseIndex: number
): string {
  // Convert to string
  let purchaseIndexAsString = purchaseIndex.toString()
  // Check if the output is a decimal
  if (purchaseIndexAsString.indexOf('.') > 0) {
    purchaseIndexAsString = purchaseIndex.toString().split('.')[0]
  }
  let fixedPriceSalePurchaseId =
    saleAddress.toHexString() + '/purchases/' + userAddres.toHexString() + '/' + purchaseIndexAsString // number is apparently a float in WS
  return fixedPriceSalePurchaseId
}

/**
 * Creates a new FixedPriceSaleUser entity or returns an existing one
 */
export function createOrGetFixedPriceSaleUser(
  saleAddress: Address,
  userAddres: Address,
  timestamp: BigInt
): FixedPriceSaleUser {
  let fixedPriceSaleUserId = createFixedPriceSaleUserId(saleAddress, userAddres)

  // First, fetch or register the new user
  let fixedPriceSaleUser = FixedPriceSaleUser.load(fixedPriceSaleUserId)
  // Create them
  if (fixedPriceSaleUser == null) {
    fixedPriceSaleUser = new FixedPriceSaleUser(fixedPriceSaleUserId)
    fixedPriceSaleUser.totalPurchase = 0
    fixedPriceSaleUser.totalVolume = BigInt.fromI32(0)
    fixedPriceSaleUser.createdAt = timestamp.toI32()
    fixedPriceSaleUser.updatedAt = timestamp.toI32()
    fixedPriceSaleUser.sale = saleAddress.toHexString()
    fixedPriceSaleUser.address = userAddres
    fixedPriceSaleUser.save()
  }

  return fixedPriceSaleUser as FixedPriceSaleUser
}

/**
 * Returns the total purchases
 * @param saleAddress
 * @param userAddres
 * @returns
 */
export function getFixedPriceSaleUserTotalPurchase(fixedPriceSaleUserId: string): number {
  // First, fetch or register the new user
  let fixedPriceSaleUser = FixedPriceSaleUser.load(fixedPriceSaleUserId)

  if (fixedPriceSaleUser == null) {
    return 0
  }

  return fixedPriceSaleUser.totalPurchase
}
