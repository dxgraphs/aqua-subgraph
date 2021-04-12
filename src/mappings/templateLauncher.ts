// Contract ABIs and Events
import {
  TemplateAdded,
  TemplateRemoved,
  TemplateVerified,
  TemplateLaunched
} from '../../generated/TemplateLauncher/TemplateLauncher'

// Helpers
import { fetchTemplateName } from '../helpers/templates'

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
  saleTemplate.factory = event.address.toHexString()
  // Template contract address
  saleTemplate.address = event.params.template.toHexString()
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
  let saleTemplate = Schemas.SaleTemplate.load(event.params.templateId.toHexString())
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
  let saleTemplate = Schemas.SaleTemplate.load(event.params.templateId.toHexString())
  if (saleTemplate) {
    saleTemplate.updatedAt = event.block.timestamp.toI32()
    saleTemplate.deletedAt = event.block.timestamp.toI32()
    // Save entity
    saleTemplate.save()
  }
}
