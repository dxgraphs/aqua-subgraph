// Externals
import { constants, providers, utils } from 'ethers'
// Helpers
import {
  FixedPriceSale__factory,
  FixedPriceSaleTemplate__factory,
  FixedPriceSale,
  ERC20Mintable
} from '../utils/typechain-contracts'
import { createFixedPriceSale, createTokenAndMintAndApprove } from '../utils/contracts'
import { aquaJestBeforeAll, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { getSigners, increaseBockTimestamp, mineBlock } from '../utils/evm'
import { wait } from '../utils'

// Test block
describe('FixedPriceSale', () => {
  let aqua: AquaJestBeforeEachContext,
    launchedfixedPriceSale: FixedPriceSale,
    biddingToken: ERC20Mintable,
    fixedPriceSaleToken: ERC20Mintable,
    deployer: providers.JsonRpcSigner,
    saleCreator: providers.JsonRpcSigner,
    saleInvestorA: providers.JsonRpcSigner,
    saleInvestorB: providers.JsonRpcSigner

  beforeAll(async () => {
    await aquaJestBeforeAll()
  })

  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
    let signers = getSigners(aqua.provider)
    deployer = signers[0]
    saleCreator = signers[1]
    saleInvestorA = signers[2]
    saleInvestorB = signers[3]

    // Register sale
    const fixedPriceSale = await new FixedPriceSale__factory(deployer).deploy()
    // Register FixedPriceSale in SaleLauncher
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(deployer).deploy()
    // Register sale in SaleLauncher
    await (await aqua.saleLauncher.addTemplate(fixedPriceSale.address)).wait(1)
    // Regiter template in TemplateLauncher
    await (await aqua.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)).wait(1)
    // Deploy, mint and approve Auctioning Token
    fixedPriceSaleToken = await createTokenAndMintAndApprove({
      name: 'Fixed Price Sale Token',
      symbol: 'FPST',
      addressToApprove: aqua.saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator],
      signer: saleCreator
    })
    // Deploy, mint and approve Bidding Token
    biddingToken = await createTokenAndMintAndApprove({
      name: 'Bidding Token',
      symbol: 'BT',
      addressToApprove: aqua.saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator, saleInvestorA, saleInvestorB],
      signer: deployer
    })
    // Launch FixedPriceSale
    const newFixedPriceSaleAddress = await createFixedPriceSale({
      templateId: 1,
      aquaFactory: aqua.aquaFactory,
      saleLauncher: aqua.saleLauncher,
      biddingToken: biddingToken,
      saleToken: fixedPriceSaleToken,
      saleCreator
    })

    launchedfixedPriceSale = FixedPriceSale__factory.connect(newFixedPriceSaleAddress, saleCreator)
    await aqua.waitForSubgraphSync()
    await wait(5000)
  })

  test('Should increase soldAmount by number of committed tokens', async () => {
    // Approve
    await (
      await biddingToken.connect(saleInvestorB).approve(launchedfixedPriceSale.address, constants.MaxUint256)
    ).wait()

    const saleInfo = await launchedfixedPriceSale.saleInfo()
    // Get current soldAmount
    const { data: currentSnapshot } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${launchedfixedPriceSale.address}") {
        soldAmount
      }
    }`)
    // Open sale
    await mineBlock(aqua.provider, saleInfo.startDate.toNumber() + 180)
    const commitTokensAmount = utils.parseEther('4')
    // soldAmount + new committed tokens amount
    const expectedSoldAmount = commitTokensAmount.add(currentSnapshot.fixedPriceSale.soldAmount)
    // Commit tokens
    const { events, blockNumber } = await (
      await launchedfixedPriceSale.connect(saleInvestorB).commitTokens(commitTokensAmount)
    ).wait()
    // Sync subgraph
    await aqua.waitForSubgraphSync(blockNumber)
    await wait(20000)
    const { data } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${launchedfixedPriceSale.address}") {
        soldAmount
      }
    }`)

    expect(data.fixedPriceSale.soldAmount).toMatch(expectedSoldAmount.toString())
  })
})
