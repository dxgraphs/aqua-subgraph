// Externals
import { utils } from 'ethers'
// Helpers
import { FixedPriceSale__factory, ParticipantList__factory, FixedPriceSaleTemplate__factory } from '@dxdao/aqua-sc'
import { createFixedPriceSale, createTokenAndMintAndApprove } from '../utils/contracts'
import { aquaJestBeforeAll, aquaJestBeforeEach, AquaJestBeforeEachContext } from '../jest/setup'
import { getSigners } from '../utils/evm'
import { wait } from '../utils'

// Test block
describe('SaleLauncher', function () {
  let aqua: AquaJestBeforeEachContext

  beforeAll(async () => {
    await aquaJestBeforeAll()
  })

  beforeEach(async () => {
    aqua = await aquaJestBeforeEach()
  })

  test('Should save new FixedPriceSale with all expected properties', async () => {
    const [deployer, saleCreator, saleInvestorA, saleInvestorB] = getSigners(aqua.provider)
    // Register sale
    const fixedPriceSale = await new FixedPriceSale__factory(deployer).deploy()
    // Register FixedPriceSale in SaleLauncher
    const fixedPriceSaleTemplate = await new FixedPriceSaleTemplate__factory(deployer).deploy()
    // Register sale in SaleLauncher
    await (await aqua.saleLauncher.addTemplate(fixedPriceSale.address)).wait(1)
    // Regiter template in TemplateLauncher
    await (await aqua.templateLauncher.addTemplate(fixedPriceSaleTemplate.address)).wait(1)

    // Deploy, mint and approve Auctioning Token
    const fixedPriceSaleToken = await createTokenAndMintAndApprove({
      name: 'Fixed Price Sale Token',
      symbol: 'FPST',
      addressToApprove: aqua.saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator],
      signer: saleCreator
    })

    // Deploy, mint and approve Bidding Token
    const biddingToken = await createTokenAndMintAndApprove({
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
      saleCreator,
      participantList: true
    })

    const launchedfixedPriceSale = FixedPriceSale__factory.connect(newFixedPriceSaleAddress, saleCreator)
    const saleInfo = await launchedfixedPriceSale.saleInfo()
    const participantList = ParticipantList__factory.connect(saleInfo.participantList, saleCreator)
    const { events } = await (
      await participantList.setParticipantAmounts([await saleInvestorA.getAddress()], [0])
    ).wait(1)

    await aqua.waitForSubgraphSync()
    await wait(5000)
    const { data } = await aqua.querySubgraph(`{
      fixedPriceSale (id: "${newFixedPriceSaleAddress}") {
          id
          status
          sellAmount
          soldAmount
          startDate
          endDate
          tokenPrice
          minRaise
          minCommitment
          maxCommitment
          participantList {
            id
            address
            managers
            participants {
              id
              address
              amount
            }
          }
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
          commitments {
            id
            user {
              address
            }
            amount
            status
          }
          launchedTemplate {
            id
            metadataContentHash
          }
      }
    }`)

    const launchedTemplate = FixedPriceSaleTemplate__factory.connect(
      data.fixedPriceSale.launchedTemplate.id,
      saleCreator
    )

    expect(data.fixedPriceSale).not.toBeNull()
    expect(data.fixedPriceSale.id).toMatch(newFixedPriceSaleAddress)
    expect(data.fixedPriceSale.status).toMatch('UPCOMING')
    expect(data.fixedPriceSale.minRaise).toMatch(saleInfo.minRaise.toString())
    expect(data.fixedPriceSale.minCommitment).toMatch(saleInfo.minCommitment.toString())
    expect(data.fixedPriceSale.maxCommitment).toMatch(saleInfo.maxCommitment.toString())
    expect(data.fixedPriceSale.sellAmount).toMatch(saleInfo.tokensForSale.toString())
    expect(data.fixedPriceSale.tokenPrice).toMatch(saleInfo.tokenPrice.toString())
    expect(data.fixedPriceSale.tokenIn.id.toLowerCase()).toMatch(biddingToken.address.toLowerCase())
    expect(data.fixedPriceSale.tokenIn.name).toMatch(await biddingToken.name())
    expect(data.fixedPriceSale.tokenIn.symbol).toMatch(await biddingToken.symbol())
    expect(data.fixedPriceSale.tokenIn.decimals).toMatch((await biddingToken.decimals()).toString())
    expect(data.fixedPriceSale.tokenOut.id.toLowerCase()).toMatch(fixedPriceSaleToken.address.toLowerCase())
    expect(data.fixedPriceSale.tokenOut.name).toMatch(await fixedPriceSaleToken.name())
    expect(data.fixedPriceSale.tokenOut.symbol).toMatch(await fixedPriceSaleToken.symbol())
    expect(data.fixedPriceSale.tokenOut.decimals).toMatch((await fixedPriceSaleToken.decimals()).toString())
    expect(Array.isArray(data.fixedPriceSale.commitments)).toBeTruthy()
    expect(data.fixedPriceSale.commitments.length).toBe(0)
    expect(data.fixedPriceSale.participantList.participants.length).toBe(1)
    expect(data.fixedPriceSale.launchedTemplate.metadataContentHash).toMatch(
      await launchedTemplate.metaDataContentHash()
    )

    const [saleParticipant] = data.fixedPriceSale.participantList.participants
    expect(saleParticipant.address).toBe((await saleInvestorA.getAddress()).toLowerCase())
    expect(saleParticipant.amount).toBe((await participantList.participantAmounts(saleParticipant.address)).toString())
  })
})
