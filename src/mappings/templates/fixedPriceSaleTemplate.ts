import { LaunchedSaleTemplate } from '../../../generated/schema'
import { TemplateInitialized } from '../../../generated/templates/FixedPriceSaleTemplate/FixedPriceSaleTemplate'

export function handleTemplateInitialized(event: TemplateInitialized): void {
  let launchedSaleTemplate = LaunchedSaleTemplate.load(event.address.toHexString())
  if (launchedSaleTemplate) {
    launchedSaleTemplate.initialized = true
    launchedSaleTemplate.save()
  }
}
