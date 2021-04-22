// Externals
import { Address } from '@graphprotocol/graph-ts'

// Contracts ABIs and types
import { MesaFactory as MesaFactoryContract } from '../../generated/MesaFactory/MesaFactory'
// MesaFactory Schema
import { MesaFactory } from '../../generated/schema'

// Used for ID in GraphlQL
export abstract class MESA_FACTORY {
  static ID: string = 'MesaFactory'
  static NAME: string = 'MesaFactory'
}

/**
 * Returns the MesaFactory. Use this inside any function to access the factory.
 * @param auctionAddress
 * @returns
 */
export function getMesaFactory(): MesaFactory {
  return MesaFactory.load(MESA_FACTORY.NAME) as MesaFactory
}

/**
 * Returns the MesaFactory Contract. Use this inside any function to access the factory contract.
 * @param auctionAddress
 * @returns
 */
export function getMesaFactoryContract(): MesaFactoryContract {
  // Get the factory entity from postgres
  let mesaFactory = getMesaFactory()
  // Use that to connect to the contract on the chain
  return MesaFactoryContract.bind(Address.fromString(mesaFactory.address))
}
