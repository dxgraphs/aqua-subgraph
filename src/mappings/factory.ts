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
  mesaFactory.address = event.address.toHexString()
  // Fees collector from auctions
  mesaFactory.feeTo = event.params.feeTo.toHexString()
  mesaFactory.saleFee = mesaFactoryContract.saleFee().toI32()
  mesaFactory.feeManager = event.params.feeManager.toHexString()
  // Fees
  mesaFactory.feeNumerator = event.params.feeNumerator.toI32()
  mesaFactory.templateFee = event.params.templateFee.toI32()
  // Auction count
  mesaFactory.saleCount = 0
  // Address of TemplateLauncher contract
  mesaFactory.templateLauncher = event.params.templateLauncher.toHexString()
  // Address of TemplateManager contract
  mesaFactory.templateManager = event.params.templateManager.toHexString()
  // Save
  mesaFactory.save()
}

export function handleSetFeeManager(event: SetFeeManager): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.feeManager = event.params.feeManager.toString()
  mesaFactory.save()
}

export function handleSetFeeNumerator(event: SetFeeNumerator): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.feeNumerator = event.params.feeNumerator.toI32()
  mesaFactory.save()
}

export function handleSetFeeTo(event: SetFeeTo): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.feeTo = event.params.feeTo.toString()
  mesaFactory.save()
}

export function handleSetSaleFee(event: SetSaleFee): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.saleFee = event.params.saleFee.toI32()
  mesaFactory.save()
}

export function handleSetTemplateFee(event: SetTemplateFee): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.templateFee = event.params.templateFee.toI32()
  mesaFactory.save()
}

export function handleSetTemplateManager(event: SetTemplateManager): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.templateManager = event.params.templateManager.toString()
  mesaFactory.save()
}

export function handleSetTemplateLauncher(event: SetTemplateLauncher): void {
  let mesaFactory = Schemas.MesaFactory.load(MESA_FACTORY.ID)

  if (!mesaFactory) {
    return
  }

  mesaFactory.templateLauncher = event.params.templateLauncher.toString()
  mesaFactory.save()
}
