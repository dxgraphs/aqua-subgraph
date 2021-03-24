// Contract ABIs and Events
import { TemplateAdded, TemplateRemoved, TemplateVerified } from '../../generated/TemplateLauncher/TemplateLauncher'

// Helpers
import { fetchTemplateName } from './helpers'

// GraphQL Schemas
import { AuctionTemplate } from '../../generated/schema'

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateAdded(event: TemplateAdded): void {
  let auctionTemplate = new AuctionTemplate(event.params.templateId.toHexString())
  // Factory address
  auctionTemplate.factory = event.address.toHexString()
  // Auction address
  auctionTemplate.address = event.params.template.toHexString()
  // Auction name: used to resolve ID to contract ABIs
  auctionTemplate.name = fetchTemplateName(event.address)
  // By default, templates are unverified
  auctionTemplate.verified = false
  // Save entity
  auctionTemplate.save()
}

/**
 * Handles adding a new template
 * @param event the `TemplateAdded` event
 */
export function handleTemplateVerified(event: TemplateVerified): void {
  let auctionTemplate = AuctionTemplate.load(event.params.templateId.toHexString())
  if (auctionTemplate) {
    auctionTemplate.verified = true
    // Save entity
    auctionTemplate.save()
  }
}

/**
 * Handles removing templates from the contract
 * @param event
 */
export function handleTemplateRemved(event: TemplateRemoved): void {}
