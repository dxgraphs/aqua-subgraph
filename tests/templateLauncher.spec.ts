// Helpers
import { aquaJestBeforeAll, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { FixedPriceSaleTemplate__factory } from '../utils/typechain-contracts'
import { addSaleTemplateToLauncher } from '../utils/contracts'
import { SUBGRAPH_SYNC_SECONDS } from '../utils/constants'
import { wait } from '../utils/time'

// Test block
describe('TemplateLauncher', function () {
  let aqua: AquaJestBeforeEachContext

  beforeAll(async () => {
    await aquaJestBeforeAll()
  })
  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
  })

  test('Should save new SaleTemplate', async () => {
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(aqua.provider.getSigner(0)).deploy()
    const event = await addSaleTemplateToLauncher({
      launcher: aqua.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })

    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            address
            factory
            name
            verified
          }
        }`)
    expect(data.saleTemplate.address.toLowerCase()).toMatch(fixedPriceSaleTemplate.address.toLowerCase())
    expect(data.saleTemplate.factory.toLowerCase()).toMatch(aqua.aquaFactory.address.toLowerCase())
    expect(data.saleTemplate.name.toLowerCase()).toMatch('FixedPriceSaleTemplate'.toLowerCase())
    expect(data.saleTemplate.verified).toBeFalsy()
  })

  test('Should save update SaleTemplate as verified', async () => {
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(aqua.provider.getSigner(0)).deploy()
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
    expect(data.saleTemplate.verified).toBeTruthy()
  })

  test('Should save remove SaleTemplate', async () => {
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(aqua.provider.getSigner(0)).deploy()
    const event = await addSaleTemplateToLauncher({
      launcher: aqua.templateLauncher,
      saleTemplateAddress: fixedPriceSaleTemplate.address
    })
    await (await aqua.templateLauncher.removeTemplate(event.templateId)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          saleTemplate (id: "${event.templateId}") {
            deletedAt
          }
        }`)
    expect(data.saleTemplate.deletedAt).not.toBeNull()
  })
})
