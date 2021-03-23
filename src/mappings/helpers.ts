// Externals
import { Address, BigInt } from '@graphprotocol/graph-ts'

// Contract ABIs and Events
import { AuctionTemplateNameBytes } from '../../generated/TemplateLauncher/AuctionTemplateNameBytes'
import { ERC20SymbolBytes } from '../../generated/EasyAuction/ERC20SymbolBytes'
import { ERC20NameBytes } from '../../generated/EasyAuction/ERC20NameBytes'
import { ERC20 } from '../../generated/EasyAuction/ERC20'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'

// Predefined Auction status
export abstract class AUCTION_STATUS {
  static UPCOMING: string = 'upcoming'
  static SETTLED: string = 'settled'
  static ENDED: string = 'ended'
  static OPEN: string = 'open'
}

// Predefined Auction Bid status
export abstract class BID_STATUS {
  static SUBMITTED: string = 'submitted'
  static CANCELLED: string = 'cancelled'
  static SETTLED: string = 'settled'
  static CLAIMED: string = 'claimed'
}

/**
 * Checks if value is equal to zero
 */
export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

/**
 * Fetches an ERC20's token name
 * @param tokenAddress
 * @returns
 */
export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

/**
 * Fetches an ERC20's token symbol
 * @param tokenAddress the ERC20 contract address
 * @returns
 */
export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

/**
 * Fetches an ERC20's token decimals
 * @param tokenAddress the ERC20 contract address
 */
export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = null
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return BigInt.fromI32(decimalValue)
}

/**
 * Returns an existing AuctionToken instance if exists.
 * Creates a new instance if it does not.
 * @param tokenAddress the ERC20 contract address
 */
export function getOrCreateAuctionToken(tokenAddress: Address): Schemas.AuctionToken {
  // Try to fetch existing token
  let auctionToken = Schemas.AuctionToken.load(tokenAddress.toHexString())
  // Token does not exist, create new record
  if (auctionToken == null) {
    auctionToken = new Schemas.AuctionToken(tokenAddress.toHexString())
    // Set the address
    auctionToken.address = tokenAddress.toHexString()
  }
  return auctionToken as Schemas.AuctionToken
}

/**
 * Returns the template name from the `<TemplateName>Template` contract.
 * @param address the address of the contract
 */
export function fetchTemplateName(address: Address): string {
  let auctionTemplateContract = AuctionTemplateNameBytes.bind(address)
  return auctionTemplateContract.templateName()
}
