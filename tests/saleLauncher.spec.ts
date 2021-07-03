// Externals
import { utils } from 'ethers'
// Helpers
import { createTokenAndMintAndApprove, getContractFactory, SUBGRAPH_SYNC_SECONDS, wait, getSigners } from './helpers'
import { FixedPriceSale, FixedPriceSaleTemplate, FixedPriceSale__factory } from './helpers/contracts'
import { mesaJestAfterEach, mesaJestBeforeEach, MesaJestBeforeEachContext } from '../jest/setup'
import { createFixedPriceSale } from '../scripts/helpers'

// Test block
describe('SaleLauncher', function() {
  let mesa: MesaJestBeforeEachContext

  beforeEach(async () => {
    mesa = await mesaJestBeforeEach()
  })

  afterEach(async () => {
    await mesaJestAfterEach()
  })

  test('Should save new FixedPriceSale with all expected properties', async () => {
    const [deployer, saleCreator, saleInvestorA, saleInvestorB] = getSigners(mesa.provider)
    // Register sale
    const fixedPriceSale = (await getContractFactory('FixedPriceSale', deployer).deploy()) as FixedPriceSale
    // Register FixedPriceSale in SaleLauncher
    const fixedPriceSaleTemplate = (await getContractFactory(
      'FixedPriceSaleTemplate',
      mesa.provider.getSigner(0)
    ).deploy()) as FixedPriceSaleTemplate
    // Register sale in SaleLauncher
    const txReceipt1 = await (await mesa.saleLauncher.addTemplate(fixedPriceSale.address)).wait(1)
    // Regiter template in TemplateLauncher
    const txReceipt2 = await (await mesa.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)).wait(1)
    // Deploy, mint and approve Auctioning Token
    const fixedPriceSaleToken = await createTokenAndMintAndApprove({
      name: 'Fixed Price Sale Token',
      symbol: 'FPST',
      addressToApprove: mesa.saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator],
      signer: saleCreator
    })

    // Deploy, mint and approve Bidding Token
    const biddingToken = await createTokenAndMintAndApprove({
      name: 'Bidding Token',
      symbol: 'BT',
      addressToApprove: mesa.saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator, saleInvestorA, saleInvestorB],
      signer: deployer
    })
    // Launch FixedPriceSale
    const newFixedPriceSaleAddress = await createFixedPriceSale({
      templateId: 1,
      mesaFactory: mesa.mesaFactory,
      saleLauncher: mesa.saleLauncher,
      biddingToken: biddingToken,
      saleToken: fixedPriceSaleToken,
      saleCreator
    })
    const launchedfixedPriceSale = FixedPriceSale__factory.connect(newFixedPriceSaleAddress, saleCreator)

    await wait(SUBGRAPH_SYNC_SECONDS * 5)

    const { data } = await mesa.fetchFromTheGraph(`{
      fixedPriceSale (id: "${newFixedPriceSaleAddress}") {
          id
          status
          sellAmount
          startDate
          endDate
          tokenPrice
          minimumRaise
          allocationMin
          allocationMax
          tokenIn {
            id
            name
            symbol
            decimals
          }
          tokenOut {
            id
            name
            symbol
            decimals
          }
          purchases {
            id
            amount
            buyer
          }
      }
    }`)

    expect(data.data.fixedPriceSale.id).toMatch(newFixedPriceSaleAddress)
    expect(data.data.fixedPriceSale.status).toMatch('UPCOMING')
    expect(data.data.fixedPriceSale.minimumRaise).toMatch((await launchedfixedPriceSale.minimumRaise()).toString())
    expect(data.data.fixedPriceSale.allocationMin).toMatch((await launchedfixedPriceSale.allocationMin()).toString())
    expect(data.data.fixedPriceSale.allocationMax).toMatch((await launchedfixedPriceSale.allocationMax()).toString())
    expect(data.data.fixedPriceSale.sellAmount).toMatch((await launchedfixedPriceSale.tokensForSale()).toString())
    expect(data.data.fixedPriceSale.tokenPrice).toMatch((await launchedfixedPriceSale.tokenPrice()).toString())
    expect(data.data.fixedPriceSale.tokenIn.id.toLowerCase()).toMatch(biddingToken.address.toLowerCase())
    expect(data.data.fixedPriceSale.tokenIn.name).toMatch(await biddingToken.name())
    expect(data.data.fixedPriceSale.tokenIn.symbol).toMatch(await biddingToken.symbol())
    expect(data.data.fixedPriceSale.tokenIn.decimals).toMatch((await biddingToken.decimals()).toString())
    expect(data.data.fixedPriceSale.tokenOut.id.toLowerCase()).toMatch(fixedPriceSaleToken.address.toLowerCase())
    expect(data.data.fixedPriceSale.tokenOut.name).toMatch(await fixedPriceSaleToken.name())
    expect(data.data.fixedPriceSale.tokenOut.symbol).toMatch(await fixedPriceSaleToken.symbol())
    expect(data.data.fixedPriceSale.tokenOut.decimals).toMatch((await fixedPriceSaleToken.decimals()).toString())
    expect(Array.isArray(data.data.fixedPriceSale.purchases)).toBeTruthy()
    expect(data.data.fixedPriceSale.purchases.length).toBe(0)
  })
})
