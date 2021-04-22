// Helpers
import { mesaJestAfterEach, mesaJestBeforeEach, MesaJestBeforeEachContext } from '../jest/setup'
import { ETH_ZERO_ADDRESS, SUBGRAPH_SYNC_SECONDS, wait } from './helpers'

// Test block
describe('MesaFactory', function() {
  let mesa: MesaJestBeforeEachContext

  beforeEach(async () => {
    mesa = await mesaJestBeforeEach()
  })

  afterEach(async () => {
    await mesaJestAfterEach()
  })
  test('Should return MesaFactory upon initialization', async () => {
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            saleFee
            feeTo
            feeNumerator
            feeManager
            templateLauncher
            templateManager
            templateFee
          }
        }`)
    expect(data.data.mesaFactory.saleFee).toMatch((await mesa.mesaFactory.saleFee()).toString())
    expect(data.data.mesaFactory.feeTo.toLowerCase()).toMatch((await mesa.mesaFactory.feeTo()).toLowerCase())
    expect(data.data.mesaFactory.feeNumerator).toMatch((await mesa.mesaFactory.feeNumerator()).toString())
    expect(data.data.mesaFactory.feeManager.toLowerCase()).toMatch((await mesa.mesaFactory.feeManager()).toLowerCase())
    expect(data.data.mesaFactory.templateLauncher.toLowerCase()).toMatch(
      (await mesa.mesaFactory.templateLauncher()).toLowerCase()
    )
    expect(data.data.mesaFactory.templateManager.toLowerCase()).toMatch(
      (await mesa.mesaFactory.templateManager()).toLowerCase()
    )
    expect(data.data.mesaFactory.templateFee).toMatch((await mesa.mesaFactory.templateFee()).toString())
  })

  test('Should return new saleFee', async () => {
    await (await mesa.mesaFactory.setSaleFee(3)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            saleFee
          }
        }`)
    expect(data.data.mesaFactory.saleFee).toMatch((await mesa.mesaFactory.saleFee()).toString())
  })
  test('Should return new feeTo', async () => {
    await (await mesa.mesaFactory.setFeeTo(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            feeTo
          }
        }`)
    expect(data.data.mesaFactory.feeTo.toLowerCase()).toMatch((await mesa.mesaFactory.feeTo()).toLowerCase())
  })
  test('Should return new feeNumerator', async () => {
    await (await mesa.mesaFactory.setFeeNumerator(2)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            feeNumerator
          }
        }`)
    expect(data.data.mesaFactory.feeNumerator).toMatch((await mesa.mesaFactory.feeNumerator()).toString())
  })
  test('Should return new feeManager', async () => {
    await (await mesa.mesaFactory.setFeeManager(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            feeManager
          }
        }`)
    expect(data.data.mesaFactory.feeManager.toLowerCase()).toMatch((await mesa.mesaFactory.feeManager()).toLowerCase())
  })
  test('Should return new templateLauncher', async () => {
    await (await mesa.mesaFactory.setTemplateLauncher(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)

    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            templateLauncher
          }
        }`)
    expect(data.data.mesaFactory.templateLauncher).toMatch((await mesa.mesaFactory.templateLauncher()).toLowerCase())
  })
  test('Should return new templateManager', async () => {
    await (await mesa.mesaFactory.setTemplateManager(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            templateManager
          }
        }`)
    expect(data.data.mesaFactory.templateManager.toLowerCase()).toMatch(
      (await mesa.mesaFactory.templateManager()).toLowerCase()
    )
  })
  test('Should return new templateFee', async () => {
    await (await mesa.mesaFactory.setTemplateFee(10)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await mesa.fetchFromTheGraph(`{
          mesaFactory (id: "MesaFactory") {
            templateFee
          }
        }`)
    expect(data.data.mesaFactory.templateFee).toMatch((await mesa.mesaFactory.templateFee()).toString())
  })
})
