// Externals
import { upAll as upDockerCompose } from 'docker-compose'
import { ethers, providers, utils } from 'ethers'
import { start as startREPL } from 'repl'

// Contracts
import {
  // types
  FairSaleTemplate,
  TemplateLauncher,
  FixedPriceSale,
  ERC20Mintable,
  SaleLauncher,
  MesaFactory,
  FairSale,
  FixedPriceSale__factory
} from './tests/helpers/contracts'

// Helpers
import {
  createTokenAndMintAndApprove,
  getContractFactory,
  buildSubgraphYaml,
  getSigners,
  execAsync,
  wait,
  // Constants
  GRAPHQL_ENDPOINT,
  EVM_ENDPOINT
} from './tests/helpers'

// Interfaces
import { addSaleTemplateToLauncher, createFixedPriceSale, printTokens } from './scripts/helpers'

// Start explore-local
;(async () => {
  console.log(`Starting Docker`)

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
      description: 'Sale Investor'
    },
    {
      address: await saleInvestorB.getAddress(),
      description: 'Sale Investor'
    }
  ])

  // Before each unit test, a new MesaFactory, TemplateLauncher, and AuctionLauncher FairSale contract is deployed to ganache
  // then followed by deploying its subgraph to the Graph node
  const weth = (await getContractFactory('ERC20Mintable', deployer).deploy('WETH', 'WETH')) as ERC20Mintable
  // Deploy MesaFactory
  const mesaFactory = (await getContractFactory('MesaFactory', deployer).deploy()) as MesaFactory
  // Deploy TemplateLauncher
  const templateLauncher = (await getContractFactory('TemplateLauncher', deployer).deploy(
    mesaFactory.address
  )) as TemplateLauncher
  // Deploy AuctionLauncher
  const saleLauncher = (await getContractFactory('SaleLauncher', deployer).deploy(mesaFactory.address)) as SaleLauncher

  const buildSubgraphYamlConfig = {
    network: 'local',
    startBlock: mesaFactory.deployTransaction.blockNumber as number,
    contracts: {
      factory: {
        address: mesaFactory.address
      },
      saleLauncher: {
        address: saleLauncher.address
      },
      templateLauncher: {
        address: templateLauncher.address
      }
    }
  }

  console.log('Building subgraph.yaml using config', buildSubgraphYamlConfig)
  // Prepare subgraph.yaml
  await buildSubgraphYaml(buildSubgraphYamlConfig)

  // Build, create and deploy the subgraph
  console.log('Bulding subgraph')
  await execAsync('npm run codegen')
  await execAsync('npm run build')

  console.log('Creating subgraph')
  await execAsync('npm run create-local')
  console.log('Deploying subgraph')
  await execAsync('npm run deploy-local')

  // Wait for subgraph to sync
  await wait(20000)

  {
    // Initilize the Factory
    const mesaFactoryInitalizeTx = await mesaFactory.initialize(
      await deployer.getAddress(), // Fee Manager
      await deployer.getAddress(), // Fee Collector; treasury
      await deployer.getAddress(), // Template Manager: can add/remove/verify Sale Templates
      templateLauncher.address, // TemplateLauncher address
      0, // Template fee: cost to submit a new Sale Template to the Mesa Factory
      0, // zero sale fees
      0 // zero fees
    )
    console.log(`Factory initialized in block ${mesaFactoryInitalizeTx.blockNumber}`)
  }

  const templates = {
    fairSaleTemplate: (await getContractFactory('FairSaleTemplate', deployer).deploy()) as FairSaleTemplate,
    fixedPriceSaleTemplate: (await getContractFactory('FixedPriceSaleTemplate', deployer).deploy()) as FixedPriceSale
  }

  // Deploy FairSale and FixedPriceSale
  // Deploy base templates

  // Register FairSale and FixedPriceSale in SaleLauncher
  {
    const fairSale = (await getContractFactory('FairSale', deployer).deploy()) as FairSale
    const addSaleTx = await saleLauncher.addTemplate(fairSale.address)
    const addSaleTxReceipt = await addSaleTx.wait(1)
    console.log(`Registered FairSale in SaleLauncher`)
  }
  {
    const fixedPriceSale = (await getContractFactory('FixedPriceSale', deployer).deploy()) as FixedPriceSale
    const addSaleTx = await saleLauncher.addTemplate(fixedPriceSale.address)
    const addSaleTxReceipt = await addSaleTx.wait(1)
    console.log(`Registered FixedPriceSale in SaleLauncher`)
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

  // Deploy, mint and approve Auctioning Token
  const tokens = {
    fairSaleToken: await createTokenAndMintAndApprove({
      name: 'Fair Sale Token',
      symbol: 'FST',
      addressToApprove: saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator],
      signer: saleCreator
    }),
    // Deploy, mint and approve Auctioning Token
    fixedPriceSaleToken: await createTokenAndMintAndApprove({
      name: 'Fixed Price Sale Token',
      symbol: 'FPST',
      addressToApprove: saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator],
      signer: saleCreator
    }),
    // Deploy, mint and approve Bidding Token
    biddingToken: await createTokenAndMintAndApprove({
      name: 'Bidding Token',
      symbol: 'BT',
      addressToApprove: saleLauncher.address,
      numberOfTokens: utils.parseEther('1000'),
      users: [saleCreator, saleInvestorA, saleInvestorB],
      signer: deployer
    })
  }

  // Print the token into console
  await printTokens(tokens)
  // Launch a FairSale template via the factory

  // Launch FixedPriceSale
  const newFairSaleAddress = await createFixedPriceSale({
    templateId: fixedPriceSaleTemplateId,
    mesaFactory,
    saleLauncher,
    biddingToken: tokens.biddingToken,
    saleToken: tokens.fixedPriceSaleToken,
    saleCreator
  })

  console.log(`Launched a new FixedPriceSale at ${newFairSaleAddress}`)

  // Approve new SaleContract
  await tokens.biddingToken.connect(saleInvestorA).approve(newFairSaleAddress, ethers.constants.MaxUint256)
  await tokens.biddingToken.connect(saleInvestorB).approve(newFairSaleAddress, ethers.constants.MaxUint256)

  const sales = {
    fixedPriceSale: {
      saleInvestorA: FixedPriceSale__factory.connect(newFairSaleAddress, saleInvestorA),
      saleInvestorB: FixedPriceSale__factory.connect(newFairSaleAddress, saleInvestorB)
    }
  }

  // Add one bid by each investor to sale FixedPricesale
  await sales.fixedPriceSale.saleInvestorA.buyTokens(4)
  await sales.fixedPriceSale.saleInvestorA.buyTokens(5)

  console.log(`\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n Subgraph ready at ${GRAPHQL_ENDPOINT}`)

  console.log(
    `You can access ${['mesaFactory', 'templateLauncher', 'saleLauncher', 'helpers', 'templates', 'sales'].join(', ')}`
  )

  // Attach contracts to the REPL context
  // Allow use to access contracts
  const replInstance = startREPL({
    preview: true,
    useColors: true,
    prompt: `Mesa > `
  })
  // Attach to context
  replInstance.context.helpers = require('./tests/helpers')
  replInstance.context.templateLauncher = templateLauncher
  replInstance.context.saleLauncher = saleLauncher
  replInstance.context.mesaFactory = mesaFactory
  replInstance.context.templates = templates
  replInstance.context.tokens = tokens
  replInstance.context.sales = sales
})()
