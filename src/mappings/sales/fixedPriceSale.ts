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
  NewTokenWithdraw,
  NewTokenRelease,
  NewCommitment,
  SaleClosed,
  SaleInitialized
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
  // Get the user
  let fixedPriceSaleUser = createOrGetFixedPriceSaleUser(event.address, event.params.user, event.block.timestamp)
  // Increase the total purcahses by one and save
  // Push change to FixedPriceSaleUser entity
  let newCommitmentIndex = fixedPriceSaleUser.totalCommitment + 1
  fixedPriceSaleUser.totalCommitment = newCommitmentIndex
  // Increase the total volume for user+sale pair
  fixedPriceSaleUser.totalVolume = event.params.amount.plus(fixedPriceSaleUser.totalVolume)
  // Construct the commitment id
  let commitmentId = createFixedPriceSaleCommitmentId(event.address, event.params.user, newCommitmentIndex)
  // Create the FixedPriceSaleCommitment entity
  let commitment = new FixedPriceSaleCommitment(commitmentId)
  commitment.createdAt = event.block.timestamp.toI32()
  commitment.updatedAt = event.block.timestamp.toI32()
  // Update the reference
  commitment.sale = event.address.toHexString()
  commitment.user = fixedPriceSaleUser.id
  commitment.amount = event.params.amount
  commitment.status = COMITMENT_STATUS.SUBMITTED
  // update `soldAmount` field in the sale
  fixedPriceSale.soldAmount = fixedPriceSale.soldAmount.plus(event.params.amount)
  // Save all entities
  commitment.save()
  fixedPriceSale.save()
  fixedPriceSaleUser.save()
}

/**
 * WIP
 */
export function handleNewTokenWithdraw(event: NewTokenWithdraw): void {
  // Get the user
  let fixedPriceSaleUser = createOrGetFixedPriceSaleUser(event.address, event.params.user, event.block.timestamp)
  // Register the withdrawal
  let withdrawal = new FixedPriceSaleWithdrawal(createFixedPriceSaleWithdrawalId(event.address, event.params.user))
  withdrawal.createdAt = event.block.timestamp.toI32()
  withdrawal.updatedAt = event.block.timestamp.toI32()
  withdrawal.amount = event.params.amount
  // Update references
  withdrawal.sale = event.address.toHexString()
  withdrawal.user = fixedPriceSaleUser.id
  withdrawal.save()
  // Get total commitments by the investor/buyer
  let totalCommitments = getFixedPriceSaleUserTotalCommitment(
    createFixedPriceSaleUserId(event.address, event.params.user)
  )
  // Loop through the commitments and update their status for the buyer
  for (let commitmentIndex = 1; commitmentIndex <= totalCommitments; commitmentIndex++) {
    let commitment = FixedPriceSaleCommitment.load(
      createFixedPriceSaleCommitmentId(event.address, event.params.user, commitmentIndex)
    )

    if (commitment) {
      commitment.status = COMITMENT_STATUS.WITHDRAWN
      commitment.save()
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

export function handleSaleInitialized(event: SaleInitialized): void {}
