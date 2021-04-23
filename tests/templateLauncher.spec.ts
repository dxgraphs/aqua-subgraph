// Helpers
import { mesaJestAfterEach, mesaJestBeforeEach, MesaJestBeforeEachContext } from '../jest/setup'
import { getContractFactory, SUBGRAPH_SYNC_SECONDS, wait } from './helpers'
import { addSaleTemplateToLauncher } from '../scripts/helpers'
import { FixedPriceSale } from './helpers/contracts'

// Test block
describe('TemplateLauncher', function() {
  let mesa: MesaJestBeforeEachContext

  beforeEach(async () => {
    mesa = await mesaJestBeforeEach()
  })

  afterEach(async () => {
    await mesaJestAfterEach()
  })
  test('Should save new SaleTemplate', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      mesa.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: mesa.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${event.template}") {
            address
            factory
            name
            verified
          }
        }`)
    expect(data.data.saleTemplate.address.toLowerCase()).toMatch(fixedPriceSaleTemplate.address)
    expect(data.data.saleTemplate.factory.toLowerCase()).toMatch(mesa.mesaFactory.address)
    expect(data.data.saleTemplate.name.toLowerCase()).toMatch('FixedPriceSaleTemplate')
    expect(data.data.saleTemplate.verified).toBeFalsy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      mesa.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: mesa.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await mesa.templateLauncher.verifyTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            verified
          }
        }`)
    expect(data.data.saleTemplate.verified).toBeTruthy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      mesa.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: mesa.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await mesa.templateLauncher.verifyTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            verified
          }
        }`)
    expect(data.data.saleTemplate.verified).toBeTruthy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      mesa.provider.getSigner(0)
    ).deploy()) as FixedPriceSale
    const event = await addSaleTemplateToLauncher({
      launcher: mesa.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await mesa.templateLauncher.removeTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            deleted
          }
        }`)
    expect(data.data.saleTemplate.deleted).not.toBeNull()
  })
})
