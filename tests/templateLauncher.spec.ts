// Helpers
import { aquaJestAfterEach, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { getContractFactory, SUBGRAPH_SYNC_SECONDS, wait } from './helpers'
import { addSaleTemplateToLauncher } from '../scripts/helpers'
import { FixedPriceSale } from './helpers/contracts'

// Test block
describe.skip('TemplateLauncher', function() {
  let aqua: AquaJestBeforeEachContext

  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
  })

  afterEach(async () => {
    await aquaJestAfterEach()
  })
  test('Should save new SaleTemplate', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      aqua.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: aqua.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          saleTemplate (id: "${event.template}") {
            address
            factory
            name
            verified
          }
        }`)
    expect(data.data.saleTemplate.address.toLowerCase()).toMatch(fixedPriceSaleTemplate.address)
    expect(data.data.saleTemplate.factory.toLowerCase()).toMatch(aqua.aquaFactory.address)
    expect(data.data.saleTemplate.name.toLowerCase()).toMatch('FixedPriceSaleTemplate')
    expect(data.data.saleTemplate.verified).toBeFalsy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      aqua.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: aqua.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await aqua.templateLauncher.verifyTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            verified
          }
        }`)
    expect(data.data.saleTemplate.verified).toBeTruthy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      aqua.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: aqua.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await aqua.templateLauncher.verifyTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            verified
          }
        }`)
    expect(data.data.saleTemplate.verified).toBeTruthy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      aqua.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: aqua.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await aqua.templateLauncher.removeTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            deleted
          }
        }`)
    expect(data.data.saleTemplate.deleted).not.toBeNull()
  })
})
