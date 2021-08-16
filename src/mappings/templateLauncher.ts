// Contract ABIs and Events
import {
  TemplateAdded,
  TemplateRemoved,
  TemplateVerified,
  TemplateLaunched
} from '../../generated/TemplateLauncher/TemplateLauncher'
import { getAquaFactory } from '../helpers/factory'

// Helpers
import { fetchTemplateName, getSaleTemplateById } from '../helpers/templates'

// GraphQL Schemas
import * as Schemas from '../../generated/schema'

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateAdded(event: TemplateAdded): void {
  let saleTemplate = new Schemas.SaleTemplate(event.params.templateId.toString())
  // Meta
  saleTemplate.createdAt = event.block.timestamp.toI32()
  saleTemplate.updatedAt = event.block.timestamp.toI32()
  // Factory address
  saleTemplate.factory = getAquaFactory().address
  // Template contract address
  saleTemplate.address = event.params.template
  // Auction name: used to resolve ID to contract ABIs
  saleTemplate.name = fetchTemplateName(event.params.template)
  // By default, templates are unverified
  saleTemplate.verified = false
  // Save entity
  saleTemplate.save()
}

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateVerified(event: TemplateVerified): void {
  let saleTemplate = Schemas.SaleTemplate.load(event.params.templateId.toString())
  if (saleTemplate) {
    saleTemplate.verified = true
    saleTemplate.updatedAt = event.block.timestamp.toI32()
    // Save entity
    saleTemplate.save()
  }
}

/**
 * Handles removing templates from the contract
 * @param event
 */
export function handleTemplateRemoved(event: TemplateRemoved): void {
  let saleTemplate = Schemas.SaleTemplate.load(event.params.templateId.toString())
  if (saleTemplate) {
    // timestamps
    saleTemplate.updatedAt = event.block.timestamp.toI32()
    // set as deleted
    saleTemplate.deletedAt = event.block.timestamp.toI32()
    // Save entity
    saleTemplate.save()
  }
}

export function handleTemplateLaunched(event: TemplateLaunched): void {
  let launchedSaleTemplate = new Schemas.LaunchedSaleTemplate(event.params.template.toHexString())
  let saleTemplate = getSaleTemplateById(event.params.templateId.toString())
  // timestamps
  launchedSaleTemplate.createdAt = event.block.timestamp.toI32()
  launchedSaleTemplate.updatedAt = event.block.timestamp.toI32()
  // IPFS hash
  launchedSaleTemplate.metadataContentHash = event.params.metadataContentHash
  // Update reference
  launchedSaleTemplate.factory = getAquaFactory().address.toHexString()
  launchedSaleTemplate.address = event.params.template
  launchedSaleTemplate.template = saleTemplate.id
  // Add initial states
  launchedSaleTemplate.initialized = false
  launchedSaleTemplate.saleCreated = false
  // Save
  launchedSaleTemplate.save()
}
