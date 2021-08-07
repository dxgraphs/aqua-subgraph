// Externals
import { constants, providers, utils } from 'ethers'
// Helpers
import {
  FixedPriceSaleTemplate__factory,
  FixedPriceSale__factory,
  FixedPriceSale,
  ERC20Mintable
} from '../utils/typechain-contracts'
import { createFixedPriceSale, createTokenAndMintAndApprove } from '../utils/contracts'
import { aquaJestBeforeAll, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { getSigners, mineBlock } from '../utils/evm'

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
    const { blockNumber } = await (
      await launchedfixedPriceSale.connect(saleInvestorB).commitTokens(commitTokensAmount)
    ).wait()
    // Sync subgraph
    await aqua.waitForSubgraphSync(blockNumber)
    const { data } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${launchedfixedPriceSale.address}") {
        soldAmount
      }
    }`)
    expect(data.fixedPriceSale.soldAmount).toMatch(expectedSoldAmount.toString())
  })
  test('FixedPriceSaleCommitment.status should be PROCESSED after claiming tokens', async () => {
    // Approve
    await (
      await biddingToken.connect(saleInvestorB).approve(launchedfixedPriceSale.address, constants.MaxUint256)
    ).wait()

    // Connect to sale from SaleInvestorB
    const launchedfixedPriceSaleSaleInvestorB = launchedfixedPriceSale.connect(saleInvestorB)
    const saleInfo = await launchedfixedPriceSale.saleInfo()
    // Open sale
    await mineBlock(aqua.provider, saleInfo.startDate.toNumber() + 180)
    // Insure threshold is met
    const commitTokensAmount = saleInfo.minRaise
    // Commit tokens
    await (await launchedfixedPriceSaleSaleInvestorB.commitTokens(commitTokensAmount)).wait()
    // End sale
    await mineBlock(aqua.provider, saleInfo.endDate.toNumber() + 180)
    // Close sale
    await (await launchedfixedPriceSale.closeSale()).wait()
    // withdraw tokens
    // Sale is closed and threshold is met
    const withdrawTokensTxReciept = await (
      await launchedfixedPriceSaleSaleInvestorB.withdrawTokens(await saleInvestorB.getAddress())
    ).wait()
    await aqua.waitForSubgraphSync(withdrawTokensTxReciept.blockNumber)
    const { data } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${launchedfixedPriceSale.address}") {
        commitments {
          id
          status
        }
      }
    }`)
    expect(data.fixedPriceSale.commitments[0].status).toMatch('PROCESSED')
  })
  test('All FixedPriceSale.status should be UPCOMING when FixedPriceSale.startDate > block.timestamp', async () => {
    await aqua.waitForSubgraphSync()
    const { data } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${launchedfixedPriceSale.address}") {
        status
      }
    }`)
    expect(data.fixedPriceSale.status).toMatch('UPCOMING')
  })
  test('FixedPriceSale.status should be OPEN when FixedPriceSale.startDate <= block.timestamp > FixedPriceSale.endDate', async () => {
    const saleInfo = await launchedfixedPriceSale.saleInfo()
    // Time travel to open the sale
    await mineBlock(aqua.provider, saleInfo.startDate.toNumber() + 180)
    await aqua.waitForSubgraphSync()
    const { data } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${launchedfixedPriceSale.address}") {
        status
      }
    }`)
    expect(data.fixedPriceSale.status).toMatch('OPEN')
  })
})
