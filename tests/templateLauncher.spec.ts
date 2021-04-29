// Helpers
import { mesaJestAfterEach, mesaJestBeforeEach, MesaJestBeforeEachContext } from '../jest/setup'
import { getContractFactory, getSigners, SUBGRAPH_SYNC_SECONDS, wait } from './helpers'
import { FixedPriceSale, FixedPriceSaleTemplate } from './helpers/contracts'

// Test block
describe('TemplateLauncher', function() {
  let mesa: MesaJestBeforeEachContext
  let fixedPriceSaleTemplate: FixedPriceSaleTemplate
  const templateId = 1

  beforeEach(async () => {
    mesa = await mesaJestBeforeEach()

    const [deployer] = getSigners(mesa.provider)
    // Register sale
    const fixedPriceSale = (await getContractFactory('FixedPriceSale', deployer).deploy()) as FixedPriceSale
    // Register FixedPriceSale in SaleLauncher
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      deployer
    ).deploy()) as FixedPriceSaleTemplate
    // Register sale in SaleLauncher
    await (await mesa.saleLauncher.addTemplate(fixedPriceSale.address)).wait(1)
    // Regiter template in TemplateLauncher
    await (await mesa.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)).wait(1)
  })

  afterEach(async () => {
    await mesaJestAfterEach()
  })
  test('Should save new SaleTemplate', async () => {
    await wait(SUBGRAPH_SYNC_SECONDS * 3)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${templateId}") {
            id
            address
            factory
            name
            verified
          }
        }`)
    expect(data.data.saleTemplate.id.toString()).toMatch('1')
    expect(data.data.saleTemplate.address.toLowerCase()).toMatch(fixedPriceSaleTemplate.address.toLowerCase())
    expect(data.data.saleTemplate.factory.toLowerCase()).toMatch(mesa.mesaFactory.address.toLowerCase())
    expect(data.data.saleTemplate.name).toMatch(await fixedPriceSaleTemplate.templateName())
    expect(data.data.saleTemplate.verified).toBeFalsy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    await (await mesa.templateLauncher.verifyTemplate(templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS * 3)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${templateId}") {
            verified
          }
        }`)
    expect(data.data.saleTemplate.verified).toBeTruthy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    await (await mesa.templateLauncher.verifyTemplate(templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS * 3)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${templateId}") {
            verified
          }
        }`)
    expect(data.data.saleTemplate.verified).toBeTruthy()
  })
  test('Should save update SaleTemplate as verified', async () => {
    await (await mesa.templateLauncher.removeTemplate(1)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS * 3)
    const { data } = await mesa.fetchFromTheGraph(`{
          saleTemplate (id: "${templateId}") {
            deleted
          }
        }`)
    expect(data.data.saleTemplate.deleted).not.toBeNull()
  })
})
