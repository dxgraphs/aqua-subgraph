import { Address, BigInt } from '@graphprotocol/graph-ts'
import { FixedPriceSale__saleInfoResult } from '../../generated/FixedPriceSale/FixedPriceSale'
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

/**
 * Maps the graph array to named variables for readibility
 * The contract uses struct which the graph resolve to array-like shape with value-[index]
 */
export class FixedPriceSaleSaleInfo {
  /*
    struct SaleInfo {
        0 = IERC20 tokenIn;
        1 = IERC20 tokenOut;
        2 = uint256 tokenPrice;
        3 = uint256 tokensForSale;
        4 = uint256 startDate;
        5 = uint256 endDate;
        6 = uint256 minCommitment;
        7 = uint256 maxCommitment;
        8 = uint256 minRaise;
        9 = bool hasParticipantList;
        10 = address participantList;
    }*/

  readonly tokenIn: Address
  readonly tokenOut: Address
  readonly tokenPrice: BigInt
  readonly tokensForSale: BigInt
  readonly startDate: BigInt
  readonly endDate: BigInt
  readonly minCommitment: BigInt
  readonly maxCommitment: BigInt
  readonly minRaise: BigInt
  readonly hasParticipantList: boolean
  readonly participantList: Address

  private constructor(saleInfo: FixedPriceSale__saleInfoResult) {
    this.tokenIn = saleInfo.value0
    this.tokenOut = saleInfo.value1
    this.tokenPrice = saleInfo.value2
    this.tokensForSale = saleInfo.value3
    this.startDate = saleInfo.value4
    this.endDate = saleInfo.value5
    this.minCommitment = saleInfo.value6
    this.maxCommitment = saleInfo.value7
    this.minRaise = saleInfo.value8
    this.hasParticipantList = saleInfo.value9
    this.participantList = saleInfo.value10
  }

  static fromResult(saleInfo: FixedPriceSale__saleInfoResult): FixedPriceSaleSaleInfo {
    return new FixedPriceSaleSaleInfo(saleInfo)
  }
}
