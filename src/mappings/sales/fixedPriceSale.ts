// Contract ABIs and Events
import {
  getFixedPriceSaleUserTotalCommitment,
  createFixedPriceSaleCommitmentId,
  createFixedPriceSaleWithdrawalId,
  createOrGetFixedPriceSaleUser,
  createFixedPriceSaleUserId,
  COMITMENT_STATUS
} from '../../helpers/fixedPriceSale'
import {
  FixedPriceSale as FixedPriceSaleContract,
  NewTokenWithdraw,
  NewTokenRelease,
  NewCommitment,
  SaleClosed
} from '../../../generated/FixedPriceSale/FixedPriceSale'

// GraphQL Schemas
import { FixedPriceSale, FixedPriceSaleCommitment, FixedPriceSaleWithdrawal } from '../../../generated/schema'

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
 * Handles `NewCommitment` when a investors buy certain amount of tokens
 */
export function handleNewCommitment(event: NewCommitment): void {
  // Get the sale record
  let fixedPriceSale = FixedPriceSale.load(event.address.toHexString())
  if (!fixedPriceSale) {
    return
  }

  // Get the contract
  let fixedPriceSaleContract = FixedPriceSaleContract.bind(event.address)

  // Get the user
  let fixedPriceSaleUser = createOrGetFixedPriceSaleUser(event.address, event.params.user, event.block.timestamp)
  // Increase the total purcahses by one and save
  // Push change to FixedPriceSaleUser entity
  let newCommitmentIndex = fixedPriceSaleUser.totalCommitment + 1
  fixedPriceSaleUser.totalCommitment = newCommitmentIndex
  // Increase the total volume for user+sale pair
  fixedPriceSaleUser.totalVolume = event.params.amount.plus(fixedPriceSaleUser.totalVolume)
  // Construct the purchase id
  let purchaseId = createFixedPriceSaleCommitmentId(event.address, event.params.user, newCommitmentIndex)
  // Create the FixedPriceSaleCommitment entity
  let purchase = new FixedPriceSaleCommitment(purchaseId)
  purchase.createdAt = event.block.timestamp.toI32()
  purchase.updatedAt = event.block.timestamp.toI32()
  // Update the reference
  purchase.sale = event.address.toHexString()
  purchase.user = event.params.user.toHexString()
  purchase.amount = event.params.amount
  purchase.status = COMITMENT_STATUS.SUBMITTED
  // update `soldAmount` field in the sale
  fixedPriceSale.soldAmount = fixedPriceSaleContract.remainingTokensForSale()
  // Save all entities
  purchase.save()
  fixedPriceSale.save()
  fixedPriceSaleUser.save()
}

/**
 * WIP
 */
export function handleNewTokenWithdraw(event: NewTokenWithdraw): void {
  // Register the withdrawal

  let withdrawal = new FixedPriceSaleWithdrawal(createFixedPriceSaleWithdrawalId(event.address, event.params.user))
  withdrawal.createdAt = event.block.timestamp.toI32()
  withdrawal.updatedAt = event.block.timestamp.toI32()
  withdrawal.amount = event.params.amount
  // Update references
  withdrawal.sale = event.address.toHexString()
  withdrawal.user = event.params.user.toHexString()
  withdrawal.save()

  // Get total purchases by the investor/buyer
  let totalCommitments = getFixedPriceSaleUserTotalCommitment(
    createFixedPriceSaleUserId(event.address, event.params.user)
  )
  // Loop through the purchases and update their status for the buyer
  for (let purchaseIndex = 1; purchaseIndex <= totalCommitments; purchaseIndex++) {
    let purchase = FixedPriceSaleCommitment.load(
      createFixedPriceSaleCommitmentId(event.address, event.params.user, purchaseIndex)
    )

    if (purchase) {
      purchase.status = COMITMENT_STATUS.WITHDRAWN
      purchase.save()
    }
  }
}

/**
 * WIP
 */
export function handleNewTokenRelease(event: NewTokenRelease): void {
  // tokens are swapped; sent to investors
  let fixedPriceSale = FixedPriceSale.load(event.address.toHexString())
  if (!fixedPriceSale) {
    return
  }

  fixedPriceSale.status = SALE_STATUS.SETTLED
  fixedPriceSale.save()
}
