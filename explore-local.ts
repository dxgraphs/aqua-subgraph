// Externals
import { upAll as upDockerCompose } from 'docker-compose'
import { ethers, providers, utils } from 'ethers'
import { start as startREPL } from 'repl'
import log4js from 'log4js'
// Contract types
import type {
  ParticipantListLauncher,
  FairSaleTemplate,
  TemplateLauncher,
  ParticipantList,
  FixedPriceSale,
  SaleLauncher,
  AquaFactory,
  FairSale,
} from './utils/typechain-contracts'
import { FixedPriceSale__factory, ParticipantList__factory } from './utils/typechain-contracts'
// Utils
import {
  createTokenAndMintAndApprove,
  addSaleTemplateToLauncher,
  createFixedPriceSale,
  getContractFactory,
  printTokens,
  execAsync,
} from './utils/contracts'
import { buildSubgraphYaml, BuildSubgraphYmlProps, waitForGraphSync } from './utils/graph'
import { EVM_ENDPOINT, GRAPHQL_ENDPOINT } from './utils/constants'
import { getSigners, mineBlock } from './utils/evm'
import { wait } from './utils/time'

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
    await wait(10000)

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
    const aquaFactory = (await getContractFactory('AquaFactory', deployer).deploy(
      await deployer.getAddress(), // Fee Manager
      await deployer.getAddress(), // Fee Collector; treasury
      await deployer.getAddress(), // Template Manager: can add/remove/verify Sale Templates
      0, // Template fee: cost to submit a new Sale Template to the Aqua Factory
      0, // fee numerator
      0 // sale fees
    )) as AquaFactory

    // Deploy ParticipantList
    const participantList = (await getContractFactory('ParticipantList', deployer).deploy()) as ParticipantList
    const participantListLauncher = (await getContractFactory('ParticipantListLauncher', deployer).deploy(
      aquaFactory.address,
      participantList.address
    )) as ParticipantListLauncher

    console.log(`Factory initialized in block ${aquaFactory.deployTransaction.blockNumber}`)
    // Deploy TemplateLauncher
    const templateLauncher = (await getContractFactory('TemplateLauncher', deployer).deploy(
      aquaFactory.address,
      participantListLauncher.address
    )) as TemplateLauncher
    // Deploy SaleLauncher
    const saleLauncher = (await getContractFactory('SaleLauncher', deployer).deploy(aquaFactory.address)) as SaleLauncher
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
    console.log('Building subgraph')
    await execAsync('npm run codegen')
    await execAsync('npm run build')
    console.log('Creating subgraph')
    await execAsync('npm run create-local')
    console.log('Deploying subgraph')
    await execAsync('npm run deploy-local')

    // Wait for subgraph to sync
    await waitForGraphSync({
      subgraphName: 'adamazad/aqua',
      provider
    })
    // wait(20000)

    const templates = {
      fairSaleTemplate: (await getContractFactory('FairSaleTemplate', deployer).deploy()) as FairSaleTemplate,
      fixedPriceSaleTemplate: (await getContractFactory('FixedPriceSaleTemplate', deployer).deploy()) as FixedPriceSale
    }

    // Deploy FairSale and FixedPriceSale
    // Deploy base templates

    // Register FairSale and FixedPriceSale in SaleLauncher
    {
      const fairSale = (await getContractFactory('FairSale', deployer).deploy()) as FairSale
      const addSaleTxReceipt = await (await saleLauncher.addTemplate(fairSale.address)).wait(1)
      console.log(`Registered FairSale in SaleLauncher at ${addSaleTxReceipt.blockNumber}`)
    }
    {
      const fixedPriceSale = (await getContractFactory('FixedPriceSale', deployer).deploy()) as FixedPriceSale
      const addSaleTxReceipt = await (await saleLauncher.addTemplate(fixedPriceSale.address)).wait(1)
      console.log(`Registered FixedPriceSale in SaleLauncher at ${addSaleTxReceipt.blockNumber}`)
    }

    // Register FairSaleTemplate and FixedPriceTemplate on TemplateLauncher
    const { templateId: fairSaleTemplateId } = await addSaleTemplateToLauncher({
      launcher: templateLauncher,
      saleTemplateAddress: templates.fairSaleTemplate.address
    })
    console.log(`Registered FairSaleTemplate in TemplateLauncher. TemplateId = `, fairSaleTemplateId.toNumber())

    const { templateId: fixedPriceSaleTemplateId } = await addSaleTemplateToLauncher({
      launcher: templateLauncher,
      saleTemplateAddress: templates.fixedPriceSaleTemplate.address
    })

    console.log(
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

    console.log(`Launched a new FixedPriceSale at ${newFixedPriceSaleAddress}`)

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

    console.log(`Launched a new FixedPriceSale with Participant List at ${newFixedPriceSaleWithListAddress}`)

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
      console.log(`Mining block at ${saleStartDate.toNumber()}`)
      await mineBlock(provider, saleStartDate.toNumber() + 180)
    }

    {
      const { '4': saleStartDate, participantList } = await sales.fixedPriceSaleWithList.saleInvestorA.saleInfo()
      sales.fixedPriceSaleWithList.participantList = ParticipantList__factory.connect(participantList, saleCreator)
      console.log({ participantList })
      console.log(`Mining block at ${saleStartDate.toNumber()}`)
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

    console.log(`\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n Subgraph ready at ${GRAPHQL_ENDPOINT}`)

    console.log(
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
