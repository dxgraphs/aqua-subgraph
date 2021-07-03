// Contract ABIs and Events
import {
  MesaFactory as MesaFactoryContract,
  TemplateLauncherUpdated,
  TemplateManagerUpdated,
  FeeNumeratorUpdated,
  TemplateFeeUpdated,
  FactoryInitialized,
  SaleFeeUpdated,
  FeeManagerUpdated,
  FeeToUpdated
} from '../../generated/MesaFactory/MesaFactory'

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
  mesaFactory.address = event.address
  // Fees collector from auctions
  mesaFactory.feeTo = event.params.feeTo
  mesaFactory.saleFee = mesaFactoryContract.saleFee()
  mesaFactory.feeManager = event.params.feeManager
  // Fees
  mesaFactory.feeNumerator = event.params.feeNumerator
  mesaFactory.templateFee = event.params.templateFee
  // Auction count
  mesaFactory.saleCount = 0
  // Address of TemplateManager contract
  mesaFactory.templateManager = event.params.templateManager
  // Save
  mesaFactory.save()
}

export function handleFeeManagerUpdated(event: FeeManagerUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.feeManager = event.params.feeManager
    mesaFactory.save()
  }
}

export function handleFeeNumeratorUpdated(event: FeeNumeratorUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.feeNumerator = event.params.feeNumerator
    mesaFactory.save()
  }
}

export function handleFeeToUpdated(event: FeeToUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.feeTo = event.params.feeTo
    mesaFactory.save()
  }
}

export function handleSaleFeeUpdated(event: SaleFeeUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.saleFee = event.params.saleFee
    mesaFactory.save()
  }
}

export function handleTemplateFeeUpdated(event: TemplateFeeUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.templateFee = event.params.templateFee
    mesaFactory.save()
  }
}

export function handleTemplateManagerUpdated(event: TemplateManagerUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.templateManager = event.params.templateManager
    mesaFactory.save()
  }
}

export function handleTemplateLauncherUpdated(event: TemplateLauncherUpdated): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)
  if (mesaFactory) {
    mesaFactory.templateLauncher = event.params.templateLauncher
    mesaFactory.save()
  }
}
