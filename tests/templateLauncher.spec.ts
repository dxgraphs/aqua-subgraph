// Helpers
import { aquaJestBeforeAll, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { FixedPriceSaleTemplate__factory } from '../utils/typechain-contracts'
import { addSaleTemplateToLauncher } from '../utils/contracts'
import { SUBGRAPH_SYNC_SECONDS } from '../utils/constants'
import { wait } from '../utils/time'
import { Event } from 'ethers'

// Test block
describe('TemplateLauncher', function() {
  let aqua: AquaJestBeforeEachContext

  beforeAll(async () => {
    await aquaJestBeforeAll()
  })
  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
  })

  test('Should save new SaleTemplate', async () => {
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(aqua.provider.getSigner(0)).deploy()
    const { blockNumber, events } = await (
      await aqua.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)
    ).wait()

    // @ts-ignore
    const templatedAddedEvent = events.find(
      event => event.event === aqua.templateLauncher.interface.getEvent('TemplateAdded').name
    ) as Event

    if (!templatedAddedEvent) {
      throw new Error('TemplateLauncher.addTemplate did not return "TemplateAdded" event.')
    }

    await aqua.waitForSubgraphSync(blockNumber)
    const { data } = await aqua.querySubgraph(`{
          saleTemplate (id: "${templatedAddedEvent?.args?.templateId}") {
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
    const { events } = await (await aqua.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)).wait()

    // @ts-ignore
    const templatedAddedEvent = events.find(
      event => event.event === aqua.templateLauncher.interface.getEvent('TemplateAdded').name
    ) as Event

    if (!templatedAddedEvent) {
      throw new Error('TemplateLauncher.addTemplate did not return "TemplateAdded" event.')
    }

    const { blockNumber } = await (
      await aqua.templateLauncher.verifyTemplate(templatedAddedEvent?.args?.templateId)
    ).wait(1)

    await aqua.waitForSubgraphSync(blockNumber)
    const { data } = await aqua.querySubgraph(`{
          saleTemplate (id: "${templatedAddedEvent?.args?.templateId}") {
            verified
          }
        }`)
    expect(data.saleTemplate.verified).toBeTruthy()
  })

  test('Should save remove SaleTemplate', async () => {
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(aqua.provider.getSigner(0)).deploy()
    const { events } = await (await aqua.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)).wait()
    // @ts-ignore
    const templatedAddedEvent = events.find(
      event => event.event === aqua.templateLauncher.interface.getEvent('TemplateAdded').name
    ) as Event

    if (!templatedAddedEvent) {
      throw new Error('TemplateLauncher.addTemplate did not return "TemplateAdded" event.')
    }

    const { blockNumber } = await (
      await aqua.templateLauncher.removeTemplate(templatedAddedEvent?.args?.templateId)
    ).wait(1)
    await aqua.waitForSubgraphSync(blockNumber)
    const { data } = await aqua.querySubgraph(`{
          saleTemplate (id: "${templatedAddedEvent?.args?.templateId}") {
            deletedAt
          }
        }`)
    expect(data.saleTemplate.deletedAt).not.toBeNull()
  })
})
