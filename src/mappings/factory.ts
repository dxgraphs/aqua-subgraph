// Contract ABIs and Events
import {
  AquaFactory as AquaFactoryContract,
  TemplateLauncherUpdated,
  TemplateManagerUpdated,
  FeeNumeratorUpdated,
  TemplateFeeUpdated,
  FactoryInitialized,
  FeeManagerUpdated,
  SaleFeeUpdated,
  FeeToUpdated
} from '../../generated/AquaFactory/AquaFactory'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'

// Mapping helpers
import { AQUA_FACTORY } from '../helpers/factory'

/**
 * Handle initilizing the AquaFactory.
 * Presumely, this handler is called once
 * @param event
 * @returns
 */
export function handleFactoryInitialized(event: FactoryInitialized): void {
  let factoryContract = AquaFactoryContract.bind(event.address)
  let factory = new Schemas.AquaFactory(AQUA_FACTORY.ID)
  // Address of factory
  factory.address = event.address
  // Fees collector from auctions
  factory.feeTo = event.params.feeTo
  factory.saleFee = factoryContract.saleFee()
  factory.feeManager = event.params.feeManager
  // Fees
  factory.feeNumerator = event.params.feeNumerator
  factory.templateFee = event.params.templateFee
  // Auction count
  factory.saleCount = 0
  // Address of TemplateManager contract
  factory.templateManager = event.params.templateManager
  // Save
  factory.save()
}

export function handleFeeManagerUpdated(event: FeeManagerUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.feeManager = event.params.feeManager
    factory.save()
  }
}

export function handleFeeNumeratorUpdated(event: FeeNumeratorUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.feeNumerator = event.params.feeNumerator
    factory.save()
  }
}

export function handleFeeToUpdated(event: FeeToUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.feeTo = event.params.feeTo
    factory.save()
  }
}

export function handleSaleFeeUpdated(event: SaleFeeUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.saleFee = event.params.saleFee
    factory.save()
  }
}

export function handleTemplateFeeUpdated(event: TemplateFeeUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.templateFee = event.params.templateFee
    factory.save()
  }
}

export function handleTemplateManagerUpdated(event: TemplateManagerUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.templateManager = event.params.templateManager
    factory.save()
  }
}

export function handleTemplateLauncherUpdated(event: TemplateLauncherUpdated): void {
  let factory = Schemas.AquaFactory.load(AQUA_FACTORY.ID)
  if (factory) {
    factory.templateLauncher = event.params.templateLauncher
    factory.save()
  }
}

/**
 * See TemplateLauncher for this implementation
 */
export function handleTemplateLaunched(): void {}
