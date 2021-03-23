// Contract ABIs and Events
import { TemplateAdded } from '../../generated/TemplateLauncher/TemplateLauncher'

// Helpers
import { fetchTemplateName } from './helpers'

// GraphQL Schemas
import { AuctionTemplate } from '../../generated/schema'

export function handleTemplateAdded(event: TemplateAdded): void {
  let auctionTemplate = new AuctionTemplate(event.params.templateId.toHexString())
  // Factory address
  auctionTemplate.factory = event.address.toHexString()
  // Auction address
  auctionTemplate.address = event.params.template.toHexString()
  // Auction name: used to resolve ID to contract ABIs
  auctionTemplate.name = fetchTemplateName(event.address)

  // Save entity
  auctionTemplate.save()
}
