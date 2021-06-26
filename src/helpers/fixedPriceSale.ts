import { Address, BigInt } from '@graphprotocol/graph-ts'
import { FixedPriceSaleUser } from '../../generated/schema'

// Predefined Auction Bid status
export abstract class PURCHASE_STATUS {
  static SUBMITTED: string = 'SUBMITTED'
  static CLAIMED: string = 'claimed'
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
  let fixedPriceSalePurchaseId =
    saleAddress.toHexString() + '/purchases/' + userAddres.toHexString() + '/' + purchaseIndex.toString()
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
    fixedPriceSaleUser.totalPurchases = 0
    fixedPriceSaleUser.createdAt = timestamp.toI32()
    fixedPriceSaleUser.updatedAt = timestamp.toI32()
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
export function getFixedPriceSaleUserTotalPurchases(fixedPriceSaleUserId: string): number {
  // First, fetch or register the new user
  let fixedPriceSaleUser = FixedPriceSaleUser.load(fixedPriceSaleUserId)

  if (fixedPriceSaleUser == null) {
    return 0
  }

  return fixedPriceSaleUser.totalPurchases
}
