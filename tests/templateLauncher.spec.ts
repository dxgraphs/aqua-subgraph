// Helpers
import { aquaJestBeforeAll, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import {
  FixedPriceSale,
  FixedPriceSaleTemplate,
  FixedPriceSaleTemplate__factory,
  FixedPriceSale__factory
} from '@dxdao/aqua-sc'
import { ContractTransaction, Event } from 'ethers'

// Test block
describe('TemplateLauncher', function () {
  let aqua: AquaJestBeforeEachContext
  let fixedPriceSaleTemplate: FixedPriceSaleTemplate
  let fixedPriceSale: FixedPriceSale
  let addSaleTemplateTx: ContractTransaction
  let addSaleModuleTx: ContractTransaction

  beforeAll(async () => {
    await aquaJestBeforeAll()
  })
  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
    fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(aqua.provider.getSigner(0)).deploy()
    fixedPriceSale = await new FixedPriceSale__factory(aqua.provider.getSigner(0)).deploy()
    addSaleTemplateTx = await aqua.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)
    addSaleModuleTx = await aqua.saleLauncher.addTemplate(fixedPriceSale.address)
  })

  test('Should save new SaleTemplate', async () => {
    const { blockNumber, events } = await addSaleTemplateTx.wait()
    // @ts-ignore
    const templatedAddedEvent = events.find(
      event => event.event === aqua.templateLauncher.interface.getEvent('TemplateAdded').name
    ) as Event
    if (!templatedAddedEvent) {
      throw new Error('TemplateLauncher.addTemplate did not return "TemplateAdded" event.')
    }
    await aqua.waitForSubgraphSync()
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
    const { events } = await addSaleTemplateTx.wait()
    // @ts-ignore
    const templatedAddedEvent = events.find(
      event => event.event === aqua.templateLauncher.interface.getEvent('TemplateAdded').name
    ) as Event
    if (!templatedAddedEvent) {
      throw new Error('TemplateLauncher.addTemplate did not return "TemplateAdded" event.')
    }
    const { blockNumber } = await (
      await aqua.templateLauncher.verifyTemplate(templatedAddedEvent?.args?.templateId)
    ).wait()
    await aqua.waitForSubgraphSync(blockNumber)
    const { data } = await aqua.querySubgraph(`{
          saleTemplate (id: "${templatedAddedEvent?.args?.templateId}") {
            verified
          }
        }`)
    expect(data.saleTemplate.verified).toBeTruthy()
  })

  test('Should save remove SaleTemplate', async () => {
    const { events } = await addSaleTemplateTx.wait()
    // @ts-ignore
    const templatedAddedEvent = events.find(
      event => event.event === aqua.templateLauncher.interface.getEvent('TemplateAdded').name
    ) as Event
    if (!templatedAddedEvent) {
      throw new Error('TemplateLauncher.addTemplate did not return "TemplateAdded" event.')
    }
    const { blockNumber } = await (
      await aqua.templateLauncher.removeTemplate(templatedAddedEvent?.args?.templateId)
    ).wait()
    await aqua.waitForSubgraphSync(blockNumber)
    const { data } = await aqua.querySubgraph(`{
          saleTemplate (id: "${templatedAddedEvent?.args?.templateId}") {
            deletedAt
          }
        }`)
    expect(data.saleTemplate.deletedAt).not.toBeNull()
  })
})
