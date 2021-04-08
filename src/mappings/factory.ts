// Contract ABIs and Events
import { FactoryInitialized, MesaFactory as MesaFactoryContract } from '../../generated/MesaFactory/MesaFactory'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'

// Mapping helpers
import { MESA_FACTORY } from '../helpers/factory'

/**
 * Handle initilizing the MesaFactory.
 * Presumely, this handler is called once
 * @param event
 * @returns
 */
export function handleFactoryInitialized(event: FactoryInitialized): void {
  let mesaFactoryContract = MesaFactoryContract.bind(event.address)
  let mesaFactory = new Schemas.MesaFactory(MESA_FACTORY.ID)
  // Address of factory
  mesaFactory.address = event.address.toHexString()
  // Fees collector from auctions
  mesaFactory.feeTo = event.params.feeTo.toHexString()
  mesaFactory.saleFee = mesaFactoryContract.saleFee().toI32()
  // Fees
  mesaFactory.feeManager = event.params.feeManager.toHexString()
  mesaFactory.feeNumerator = event.params.feeNumerator.toI32()
  // Auction count
  mesaFactory.saleCount = 0
  // Address of TemplateLauncher contract
  mesaFactory.templateLauncher = event.params.templateLauncher.toHexString()
  // Address of TemplateManager contract
  mesaFactory.templateManager = event.params.templateManager.toHexString()
  // Save
  mesaFactory.save()
}
