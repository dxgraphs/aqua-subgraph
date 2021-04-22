// Externals
import { Address } from '@graphprotocol/graph-ts'

// Contract ABIs and types
import { SaleTemplateNameBytes } from '../../generated/TemplateLauncher/SaleTemplateNameBytes'

// GraphQL schema
import { SaleTemplate } from '../../generated/schema'

// Available Auction types/templates/mechanisms
export abstract class SALE_TEMPLATES {
  static FAIR_SALE: string = 'FairSaleTemplate'
  static FIXED_PRICE_SALE: string = 'FixedPriceSaleTemplate'
}

/**
 * Returns the template name from the `<TemplateName>Template` contract.
 * @param address the address of the contract
 * @returns the name of the name, otherwise `unknown`
 *
 */
export function fetchTemplateName(address: Address): string {
  let saleTemplateNameBytesContract = SaleTemplateNameBytes.bind(address)
  let tryTemplateNameResult = saleTemplateNameBytesContract.try_templateName()
  if (!tryTemplateNameResult.reverted) {
    return tryTemplateNameResult.value
  }
  return 'unknown'
}

/**
 * Returns the `SaleTemplate` entity from postgres database using templateId
 * @param templateId The template from the contract
 * @returns SaleTemplate
 */
export function getSaleTemplateById(templateId: string): SaleTemplate {
  return SaleTemplate.load(templateId) as SaleTemplate
}
