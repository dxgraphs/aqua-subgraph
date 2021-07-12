import { BigNumber, BigNumberish, utils } from 'ethers'

interface EncodeInitDataFairSaleOptions {
  saleLauncher: string
  saleTemplateId: BigNumberish
  tokenOut: string
  tokenIn: string
  duration: BigNumberish
  tokenOutSupply: BigNumberish
  minPrice: BigNumberish
  minBuyAmount: BigNumberish
  minRaise: BigNumberish
  tokenSupplier: string
}

/**
 * Encodes FairSale launch parameters to an ABI string
 */
export function encodeInitDataFairSale({
  saleLauncher,
  saleTemplateId,
  tokenOut,
  tokenIn,
  duration,
  tokenOutSupply,
  minPrice,
  minBuyAmount,
  minRaise,
  tokenSupplier
}: EncodeInitDataFairSaleOptions) {
  return utils.defaultAbiCoder.encode(
    ['address', 'uint256', 'address', 'address', 'uint256', 'uint256', 'uint96', 'uint96', 'uint256', 'address'],
    [
      saleLauncher,
      saleTemplateId,
      tokenOut,
      tokenIn,
      duration,
      tokenOutSupply,
      minPrice,
      minBuyAmount,
      minRaise,
      tokenSupplier
    ]
  )
}

export interface EncodeInitDataFixedPriceOptions {
  saleLauncher: string
  saleTemplateId: BigNumberish
  tokenSupplier: string
  tokenIn: string
  tokenOut: string
  tokenPrice: BigNumber
  tokensForSale: BigNumber
  startDate: number
  endDate: number
  minCommitment: BigNumber
  maxCommitment: BigNumber
  minRaise: BigNumber
  participantList: string
}

/**
 * Encodes FixedPriceSale launch parameters to an ABI string
 */
export function encodeInitDataFixedPriceSale({
  saleLauncher,
  saleTemplateId,
  tokenSupplier,
  tokenIn,
  tokenOut,
  tokenPrice,
  tokensForSale,
  startDate,
  endDate,
  minCommitment,
  maxCommitment,
  minRaise,
  participantList
}: EncodeInitDataFixedPriceOptions): string {
  return utils.defaultAbiCoder.encode(
    [
      'address',
      'uint256',
      'address',
      'address',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'uint256',
      'bool'
    ],
    [
      saleLauncher,
      saleTemplateId,
      tokenSupplier,
      tokenIn,
      tokenOut,
      tokenPrice,
      tokensForSale,
      startDate,
      endDate,
      minCommitment,
      maxCommitment,
      minRaise,
      participantList
    ]
  )
}
