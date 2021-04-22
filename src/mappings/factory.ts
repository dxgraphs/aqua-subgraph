// Contract ABIs and Events
import {
  MesaFactory as MesaFactoryContract,
  SetTemplateLauncher,
  FactoryInitialized,
  SetTemplateManager,
  SetFeeNumerator,
  SetTemplateFee,
  SetFeeManager,
  SetSaleFee,
  SetFeeTo
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
  mesaFactory.saleFee = mesaFactoryContract.saleFee().toBigDecimal()
  mesaFactory.feeManager = event.params.feeManager
  // Fees
  mesaFactory.feeNumerator = event.params.feeNumerator.toBigDecimal()
  mesaFactory.templateFee = event.params.templateFee.toBigDecimal()
  // Auction count
  mesaFactory.saleCount = 0
  // Address of TemplateLauncher contract
  mesaFactory.templateLauncher = event.params.templateLauncher
  // Address of TemplateManager contract
  mesaFactory.templateManager = event.params.templateManager
  // Save
  mesaFactory.save()
}

export function handleSetFeeManager(event: SetFeeManager): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.feeManager = event.params.feeManager
  mesaFactory.save()
}

export function handleSetFeeNumerator(event: SetFeeNumerator): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.feeNumerator = event.params.feeNumerator.toBigDecimal()
  mesaFactory.save()
}

export function handleSetFeeTo(event: SetFeeTo): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.feeTo = event.params.feeTo
  mesaFactory.save()
}

export function handleSetSaleFee(event: SetSaleFee): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.saleFee = event.params.saleFee.toBigDecimal()
  mesaFactory.save()
}

export function handleSetTemplateFee(event: SetTemplateFee): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.templateFee = event.params.templateFee.toBigDecimal()
  mesaFactory.save()
}

export function handleSetTemplateManager(event: SetTemplateManager): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.templateManager = event.params.templateManager
  mesaFactory.save()
}

export function handleSetTemplateLauncher(event: SetTemplateLauncher): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.templateLauncher = event.params.templateLauncher
  mesaFactory.save()
}
