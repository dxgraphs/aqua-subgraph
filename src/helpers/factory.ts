// Externals
import { Address } from '@graphprotocol/graph-ts'

// Contracts ABIs and types
import { AquaFactory as AquaFactoryContract } from '../../generated/AquaFactory/AquaFactory'
// AquaFactory Schema
import { AquaFactory } from '../../generated/schema'

// Used for ID in GraphlQL
export abstract class AQUA_FACTORY {
  static ID: string = 'AquaFactory'
  static NAME: string = 'AquaFactory'
}

/**
 * Returns the AquaFactory. Use this inside any function to access the factory.
 * @param auctionAddress
 * @returns
 */
export function getAquaFactory(): AquaFactory {
  return AquaFactory.load(AQUA_FACTORY.NAME) as AquaFactory
}

/**
 * Returns the AquaFactory Contract. Use this inside any function to access the factory contract.
 * @param auctionAddress
 * @returns
 */
export function getAquaFactoryContract(): AquaFactoryContract {
  // Get the factory entity from postgres
  let aquaFactory = getAquaFactory()
  // Use that to connect to the contract on the chain
  return AquaFactoryContract.bind(Address.fromString(aquaFactory.address))
}
