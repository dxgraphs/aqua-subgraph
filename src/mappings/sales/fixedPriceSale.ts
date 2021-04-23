// Contract ABIs and Events
import {
  FixedPriceSale as FixedPriceSaleContract,
  NewTokenRelease,
  SaleClosed,
  NewTokenClaim,
  NewPurchase
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
  let fixedPriceSale = FixedPriceSale.load(event.address.toHexString())
  let fixedPriceSaleContract = FixedPriceSaleContract.bind(event.address)
  if (!fixedPriceSale) {
    return
  }
  let purchase = new FixedPriceSalePurchase(event.block.timestamp.toString())
  purchase.sale = event.address.toHexString()
  purchase.createdAt = event.block.timestamp.toI32()
  purchase.updatedAt = event.block.timestamp.toI32()
  purchase.amount = event.params.amount.toBigDecimal()
  purchase.buyer = event.params.buyer
  purchase.save()
  // update `soldAmount` field in on auction
  fixedPriceSale.soldAmount = fixedPriceSaleContract.tokensSold().toBigDecimal()
  fixedPriceSale.save()
}

/**
 * WIP
 */
export function handleNewTokenClaim(event: NewTokenClaim): void {
  // minimum raise
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
