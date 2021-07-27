// Externals
import { upAll as upDockerCompose } from 'docker-compose'
import { ethers, providers, utils } from 'ethers'
import { start as startREPL } from 'repl'
import log4js from 'log4js'
// Contract types
import {
  ParticipantList,
  FairSale__factory,
  AquaFactory__factory,
  SaleLauncher__factory,
  FixedPriceSale__factory,
  ParticipantList__factory,
  TemplateLauncher__factory,
  FairSaleTemplate__factory,
  FixedPriceSaleTemplate__factory,
  ParticipantListLauncher__factory,
} from './utils/typechain-contracts'
// Utils
import {
  execAsync,
  printTokens,
  createFixedPriceSale,
  addSaleTemplateToLauncher,
  createTokenAndMintAndApprove,
} from './utils/contracts'
import { getSigners, mineBlock } from './utils/evm'
import { EVM_ENDPOINT, GRAPHQL_ENDPOINT } from './utils/constants'
import { buildSubgraphYaml, startGraph, waitForSubgraphUp } from './utils/graph'

// Get logger
const logger = log4js.getLogger()


const SUBGRAPH_NAME = 'adamazad/aqua'

  // Start explore-local
  ; (async () => {
    logger.info(`Starting Docker`)
    try {
      await upDockerCompose()
    } catch (error) {
      console.log(error)
    }

    // Wait for everything to fire up
    await waitForSubgraphUp()

    // Connect to local ganache instance
    const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)

    // Wallets/Signers
    const [deployer, saleCreator, saleInvestorA, saleInvestorB] = getSigners(provider)

    console.table([
      {
        address: await deployer.getAddress(),
        description: 'Contracts Deployer'
      },
      {
        address: await saleCreator.getAddress(),
        description: 'Sale (IDO) Creator'
      },
      {
        address: await saleInvestorA.getAddress(),
        description: 'Sale Investor A'
      },
      {
        address: await saleInvestorB.getAddress(),
        description: 'Sale Investor B'
      }
    ])

    // Before each unit test, a new AquaFactory, TemplateLauncher, and AuctionLauncher FairSale contract is deployed to ganache
    // then followed by deploying its subgraph to the Graph node
    // Deploy AquaFactory
    const aquaFactory = await new AquaFactory__factory(deployer).deploy(
      await deployer.getAddress(), // Fee Manager
      await deployer.getAddress(), // Fee Collector; treasury
      await deployer.getAddress(), // Template Manager: can add/remove/verify Sale Templates
      0, // Template fee: cost to submit a new Sale Template to the Aqua Factory
      0, // fee numerator
      0 // sale fees
    )

    // Deploy ParticipantList
    const participantList = await new ParticipantList__factory(deployer).deploy()
    const participantListLauncher = await new ParticipantListLauncher__factory(deployer).deploy(
      aquaFactory.address,
      participantList.address
    )
    logger.info(`Factory initialized in block ${aquaFactory.deployTransaction.blockNumber}`)

    // Deploy TemplateLauncher
    const templateLauncher = await new TemplateLauncher__factory(deployer).deploy(
      aquaFactory.address,
      participantListLauncher.address
    )

    // Deploy SaleLauncher
    const saleLauncher = await new SaleLauncher__factory(deployer).deploy(aquaFactory.address)

    // Set the template launcher in factory
    {
      const setTemplateLauncherTx = await aquaFactory.setTemplateLauncher(templateLauncher.address)
      logger.info(`Template Launcher set in AquaFactory in block ${setTemplateLauncherTx.blockNumber}`)
    }

    const buildSubgraphYamlConfig: BuildSubgraphYmlProps = {
      network: 'local',
      startBlock: aquaFactory.deployTransaction.blockNumber as number,
      contracts: {
        factory: {
          address: aquaFactory.address
        },
        saleLauncher: {
          address: saleLauncher.address
        },
        templateLauncher: {
          address: templateLauncher.address
        },
        participantListLauncher: {
          address: participantListLauncher.address
        }
      }
    }

    logger.debug('Building subgraph.yaml using config', buildSubgraphYamlConfig)
    // Prepare subgraph.yaml
    await buildSubgraphYaml(buildSubgraphYamlConfig)

    // Build, create and deploy the subgraph
    logger.info('Building subgraph')
    await execAsync('npm run codegen')
    await startGraph(provider)

    const templates = {
      fairSaleTemplate: await new FairSaleTemplate__factory(deployer).deploy(),
      fixedPriceSaleTemplate: await new FixedPriceSaleTemplate__factory(deployer).deploy()
    }

    // Deploy FairSale and FixedPriceSale
    // Deploy base templates

    // Register FairSale and FixedPriceSale in SaleLauncher
    {
      const fairSale = await new FairSale__factory(deployer).deploy()
      const addSaleTxReceipt = await (await saleLauncher.addTemplate(fairSale.address)).wait(1)
      logger.info(`Registered FairSale in SaleLauncher at ${addSaleTxReceipt.blockNumber}`)
    }
    {
      const fixedPriceSale = await new FixedPriceSale__factory(deployer).deploy()
      const addSaleTxReceipt = await (await saleLauncher.addTemplate(fixedPriceSale.address)).wait(1)
      logger.info(`Registered FixedPriceSale in SaleLauncher at ${addSaleTxReceipt.blockNumber}`)
    }

    // Register FairSaleTemplate and FixedPriceTemplate on TemplateLauncher
    const { templateId: fairSaleTemplateId } = await addSaleTemplateToLauncher({
      launcher: templateLauncher,
      saleTemplateAddress: templates.fairSaleTemplate.address
    })
    logger.info(`Registered FairSaleTemplate in TemplateLauncher. TemplateId = `, fairSaleTemplateId.toNumber())

    const { templateId: fixedPriceSaleTemplateId } = await addSaleTemplateToLauncher({
      launcher: templateLauncher,
      saleTemplateAddress: templates.fixedPriceSaleTemplate.address
    })

    logger.info(
      `Registered FixedPriceSaleTemplate in TemplateLauncher. TemplateId = `,
      fixedPriceSaleTemplateId.toNumber()
    )

    console.table([
      {
        name: 'AquaFactory',
        address: aquaFactory.address
      },
      {
        name: 'SaleLauncher',
        address: saleLauncher.address
      },
      {
        name: 'TemplateLauncher',
        address: templateLauncher.address
      }
    ])

    // Deploy, mint and approve Auctioning Token
    const tokens = {
      fairSaleToken: await createTokenAndMintAndApprove({
        name: 'Fair Sale Token',
        symbol: 'FST',
        addressToApprove: saleLauncher.address,
        numberOfTokens: utils.parseUnits('1000'),
        users: [saleCreator],
        signer: saleCreator
      }),
      // Deploy, mint and approve Auctioning Token
      fixedPriceSaleToken: await createTokenAndMintAndApprove({
        name: 'Fixed Price Sale Token',
        symbol: 'FPST',
        addressToApprove: saleLauncher.address,
        numberOfTokens: utils.parseUnits('1000'),
        users: [saleCreator],
        signer: saleCreator
      }),
      // Deploy, mint and approve Bidding Token
      biddingToken: await createTokenAndMintAndApprove({
        name: 'Bidding Token',
        symbol: 'BT',
        addressToApprove: saleLauncher.address,
        numberOfTokens: utils.parseUnits('1000'),
        users: [saleCreator, saleInvestorA, saleInvestorB],
        signer: deployer
      })
    }

    // Print the token into console
    await printTokens(tokens)

    /*
    // Launch FairSale
    const newFairSaleAddress = await createFairSale({
      templateId: fairSaleTemplateId,
      aquaFactory,
      saleLauncher,
      biddingToken: tokens.biddingToken,
      saleToken: tokens.fairSaleToken,
      saleCreator
    })
  
    console.log(`Launched a new FairSale at ${newFairSaleAddress}`)
  */
    // Launch FixedPriceSale
    const newFixedPriceSaleAddress = await createFixedPriceSale({
      templateId: fixedPriceSaleTemplateId,
      aquaFactory,
      saleLauncher,
      biddingToken: tokens.biddingToken,
      saleToken: tokens.fixedPriceSaleToken,
      saleCreator
    })

    logger.info(`Launched a new FixedPriceSale at ${newFixedPriceSaleAddress}`)

    // Approve new SaleContract
    // await tokens.biddingToken.connect(saleInvestorA).approve(newFairSaleAddress, ethers.constants.MaxUint256)
    // await tokens.biddingToken.connect(saleInvestorB).approve(newFairSaleAddress, ethers.constants.MaxUint256)

    await tokens.biddingToken.connect(saleInvestorA).approve(newFixedPriceSaleAddress, ethers.constants.MaxUint256)
    await tokens.biddingToken.connect(saleInvestorB).approve(newFixedPriceSaleAddress, ethers.constants.MaxUint256)

    // Launch FixedPriceSale with ParticipantList

    const newFixedPriceSaleWithListAddress = await createFixedPriceSale({
      templateId: fixedPriceSaleTemplateId,
      aquaFactory,
      saleLauncher,
      biddingToken: tokens.biddingToken,
      saleToken: tokens.fixedPriceSaleToken,
      saleCreator,
      participantList: true
    })

    logger.info(`Launched a new FixedPriceSale with Participant List at ${newFixedPriceSaleWithListAddress}`)

    await tokens.biddingToken.connect(saleInvestorA).approve(newFixedPriceSaleWithListAddress, ethers.constants.MaxUint256)
    await tokens.biddingToken.connect(saleInvestorB).approve(newFixedPriceSaleWithListAddress, ethers.constants.MaxUint256)

    const sales = {
      fairSale: {
        // saleInvestorA: FairSale__factory.connect(newFairSaleAddress, saleInvestorA),
        // saleInvestorB: FairSale__factory.connect(newFairSaleAddress, saleInvestorB)
      },
      fixedPriceSale: {
        saleInvestorA: FixedPriceSale__factory.connect(newFixedPriceSaleAddress, saleInvestorA),
        saleInvestorB: FixedPriceSale__factory.connect(newFixedPriceSaleAddress, saleInvestorB)
      },
      fixedPriceSaleWithList: {
        saleInvestorA: FixedPriceSale__factory.connect(newFixedPriceSaleWithListAddress, saleInvestorA),
        saleInvestorB: FixedPriceSale__factory.connect(newFixedPriceSaleWithListAddress, saleInvestorB),
        participantList: null as any
      }
    }

    // Add one bid by each investor to sale FixedPricesale
    // args for placeOrders should be:
    //     _ordersTokenOut: BigNumberish[],
    //    _ordersTokenIn: BigNumberish[],
    //    _prevOrders: BytesLike[],
    //await sales.fairSale.saleInvestorA.placeOrders(utils.parseUnits('1'), utils.parseUnits('2'))
    //await sales.fairSale.saleInvestorB.placeOrders(utils.parseUnits('2'), utils.parseUnits('4.1'))

    {
      const { '4': saleStartDate } = await sales.fixedPriceSale.saleInvestorA.saleInfo()
      logger.info(`Mining block at ${saleStartDate.toNumber()}`)
      await mineBlock(provider, saleStartDate.toNumber() + 180)
    }

    {
      const { '4': saleStartDate, participantList } = await sales.fixedPriceSaleWithList.saleInvestorA.saleInfo()
      sales.fixedPriceSaleWithList.participantList = ParticipantList__factory.connect(participantList, saleCreator)
      logger.info({ participantList })
      logger.info(`Mining block at ${saleStartDate.toNumber()}`)
      await mineBlock(provider, saleStartDate.toNumber() + 180)

    }

    // Add one bid by each investor to sale FixedPricesale
    await sales.fixedPriceSale.saleInvestorA.commitTokens(utils.parseUnits('4'))
    await sales.fixedPriceSale.saleInvestorB.commitTokens(utils.parseUnits('5'))

    // Add participants to whitelist
    await (sales.fixedPriceSaleWithList.participantList as ParticipantList).setParticipantAmounts(
      [await saleInvestorA.getAddress(), await saleInvestorB.getAddress()],
      [utils.parseUnits('4'), utils.parseUnits('5')]
    )

    // Add one bid by each investor to sale FixedPricesale
    await sales.fixedPriceSaleWithList.saleInvestorA.commitTokens(utils.parseUnits('4'))
    await sales.fixedPriceSaleWithList.saleInvestorB.commitTokens(utils.parseUnits('5'))

    console.log(`\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`)
    logger.info(`Subgraph ready at ${GRAPHQL_ENDPOINT}`)

    logger.info(
      `You can access ${['aquaFactory', 'templateLauncher', 'saleLauncher', 'helpers', 'templates', 'sales'].join(', ')}`
    )

    // Attach contracts to the REPL context
    // Allow use to access contracts
    const replInstance = startREPL({
      preview: true,
      useColors: true,
      prompt: `Aqua > `
    })
    // Attach to context
    replInstance.context.utils = require('./utils')
    replInstance.context.templateLauncher = templateLauncher
    replInstance.context.saleLauncher = saleLauncher
    replInstance.context.aquaFactory = aquaFactory
    replInstance.context.templates = templates
    replInstance.context.tokens = tokens
    replInstance.context.sales = sales
  })()
