// Contract ABIs and Events
import {
  getFixedPriceSaleUserTotalPurchases,
  createFixedPriceSalePurchaseId,
  createOrGetFixedPriceSaleUser,
  createFixedPriceSaleUserId,
  PURCHASE_STATUS
} from '../../helpers/fixedPriceSale'
import {
  FixedPriceSale as FixedPriceSaleContract,
  NewTokenRelease,
  NewTokenClaim,
  NewPurchase,
  SaleClosed
} from '../../../generated/FixedPriceSale/FixedPriceSale'

// GraphQL Schemas
import { FixedPriceSale, FixedPriceSalePurchase } from '../../../generated/schema'

// Helpers
import { SALE_STATUS } from '../../helpers/sales'

export function handleSaleClosed(event: SaleClosed): void {
  let fixedPriceSale = FixedPriceSale.load(event.address.toHexString())
  if (!fixedPriceSale) {
    return
  }
  fixedPriceSale.status = SALE_STATUS.ENDED
  fixedPriceSale.updatedAt = event.block.timestamp.toI32()
  fixedPriceSale.save()
}

/**
 * WIP
 * Handles `NewPurchase` when a investors buy certain amount of tokens
 */
export function handleNewPurchase(event: NewPurchase): void {
  // Get the sale record
  let fixedPriceSale = FixedPriceSale.load(event.address.toHexString())
  if (!fixedPriceSale) {
    return
  }

  // Get the contract
  let fixedPriceSaleContract = FixedPriceSaleContract.bind(event.address)

  // Get the user
  let fixedPriceSaleUser = createOrGetFixedPriceSaleUser(event.address, event.params.buyer, event.block.timestamp)
  // Increase the total purcahses by one and save
  let newPurchaseIndex = fixedPriceSaleUser.totalPurchases + 1
  // Push change to FixedPriceSaleUser entity
  fixedPriceSaleUser.totalPurchases = newPurchaseIndex
  // Construct the purchase id
  let purchaseId = createFixedPriceSalePurchaseId(event.address, event.params.buyer, newPurchaseIndex)
  // Create the FixedPriceSalePurchase entity
  let purchase = new FixedPriceSalePurchase(purchaseId)
  purchase.createdAt = event.block.timestamp.toI32()
  purchase.updatedAt = event.block.timestamp.toI32()
  // Update the reference
  purchase.sale = event.address.toHexString()
  purchase.buyer = event.params.buyer
  purchase.amount = event.params.amount
  purchase.status = PURCHASE_STATUS.SUBMITTED
  // update `soldAmount` field in the sale
  fixedPriceSale.soldAmount = fixedPriceSaleContract.tokensSold()
  // Save all entities
  purchase.save()
  fixedPriceSale.save()
  fixedPriceSaleUser.save()
}

/**
 * WIP
 */
export function handleNewTokenClaim(event: NewTokenClaim): void {
  // Get total purchases by the investor/buyer
  let totalPurchases = getFixedPriceSaleUserTotalPurchases(
    createFixedPriceSaleUserId(event.address, event.params.buyer)
  )
  // Loop through the purchases and update their status for the buyer
  for (let purchaseIndex = 1; purchaseIndex <= totalPurchases; purchaseIndex++) {
    let purchase = FixedPriceSalePurchase.load(
      createFixedPriceSalePurchaseId(event.address, event.params.buyer, purchaseIndex)
    )

    if (purchase) {
      purchase.status = PURCHASE_STATUS.CLAIMED
      purchase.save()
    }
  }
}

/**
 * WIP
 */
export function handleNewTokenRelease(event: NewTokenRelease): void {
  // tokens are swapped; sent to investors
  //
  let fixedPriceSale = FixedPriceSale.load(event.address.toHexString())
  if (!fixedPriceSale) {
    return
  }

  fixedPriceSale.status = SALE_STATUS.SETTLED
  fixedPriceSale.save()
}
