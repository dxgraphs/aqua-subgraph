// Helpers
import { aquaJestAfterEach, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { ETH_ZERO_ADDRESS, SUBGRAPH_SYNC_SECONDS, wait } from './helpers'

// Test block
describe('AquaFactory', function() {
  let aqua: AquaJestBeforeEachContext

  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
  })

  afterEach(async () => {
    await aquaJestAfterEach()
  })
  test('Should return AquaFactory upon initialization', async () => {
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            saleFee
            feeTo
            feeNumerator
            feeManager
            templateLauncher
            templateManager
            templateFee
          }
        }`)
    expect(data.data.aquaFactory.saleFee).toMatch((await aqua.aquaFactory.saleFee()).toString())
    expect(data.data.aquaFactory.feeTo.toLowerCase()).toMatch((await aqua.aquaFactory.feeTo()).toLowerCase())
    expect(data.data.aquaFactory.feeNumerator).toMatch((await aqua.aquaFactory.feeNumerator()).toString())
    expect(data.data.aquaFactory.feeManager.toLowerCase()).toMatch((await aqua.aquaFactory.feeManager()).toLowerCase())
    expect(data.data.aquaFactory.templateLauncher.toLowerCase()).toMatch(
      (await aqua.aquaFactory.templateLauncher()).toLowerCase()
    )
    expect(data.data.aquaFactory.templateManager.toLowerCase()).toMatch(
      (await aqua.aquaFactory.templateManager()).toLowerCase()
    )
    expect(data.data.aquaFactory.templateFee).toMatch((await aqua.aquaFactory.templateFee()).toString())
  })

  test('Should return new saleFee', async () => {
    await (await aqua.aquaFactory.setSaleFee(3)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            saleFee
          }
        }`)
    expect(data.data.aquaFactory.saleFee).toMatch((await aqua.aquaFactory.saleFee()).toString())
  })
  test('Should return new feeTo', async () => {
    await (await aqua.aquaFactory.setFeeTo(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            feeTo
          }
        }`)
    expect(data.data.aquaFactory.feeTo.toLowerCase()).toMatch((await aqua.aquaFactory.feeTo()).toLowerCase())
  })
  test('Should return new feeNumerator', async () => {
    await (await aqua.aquaFactory.setFeeNumerator(2)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            feeNumerator
          }
        }`)
    expect(data.data.aquaFactory.feeNumerator).toMatch((await aqua.aquaFactory.feeNumerator()).toString())
  })
  test('Should return new feeManager', async () => {
    await (await aqua.aquaFactory.setFeeManager(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            feeManager
          }
        }`)
    expect(data.data.aquaFactory.feeManager.toLowerCase()).toMatch((await aqua.aquaFactory.feeManager()).toLowerCase())
  })
  test('Should return new templateLauncher', async () => {
    await (await aqua.aquaFactory.setTemplateLauncher(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)

    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            templateLauncher
          }
        }`)
    expect(data.data.aquaFactory.templateLauncher).toMatch((await aqua.aquaFactory.templateLauncher()).toLowerCase())
  })
  test('Should return new templateManager', async () => {
    await (await aqua.aquaFactory.setTemplateManager(ETH_ZERO_ADDRESS)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            templateManager
          }
        }`)
    expect(data.data.aquaFactory.templateManager.toLowerCase()).toMatch(
      (await aqua.aquaFactory.templateManager()).toLowerCase()
    )
  })
  test('Should return new templateFee', async () => {
    await (await aqua.aquaFactory.setTemplateFee(10)).wait(1)
    await wait(SUBGRAPH_SYNC_SECONDS)
    const { data } = await aqua.fetchFromTheGraph(`{
          aquaFactory (id: "AquaFactory") {
            templateFee
          }
        }`)
    expect(data.data.aquaFactory.templateFee).toMatch((await aqua.aquaFactory.templateFee()).toString())
  })
})
